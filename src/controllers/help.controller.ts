import { Router, Request, Response } from 'express';
import { Controller } from '../interfaces';
import axios from 'axios';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

const fetchCommands = async (user, repo) => {
    try {
        const url = `https://api.github.com/repos/${user}/${repo}/contents/docs/usage.md`;
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/vnd.github.v3.raw',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching commands: ${error}`);
    }
};

export class HelpController implements Controller {
    public basepath = '/help';

    public boot(): Router {
        const router: Router = Router();

        router.get(/^\/help(\/.*)?$/, async (req: Request, res: Response) => {
            const commands = req.params[0] ? req.params[0].split('/').filter(cmd => cmd.trim()) : [];

            const commandsMarkdown = await fetchCommands('asyncapi', 'cli');

            if (!commandsMarkdown) {
                return res.status(500).json({ message: 'Error fetching help information' });
            }

            if (commands.length === 0) {
                // Return information for only the list of commands
                const startOfList = commandsMarkdown.indexOf('<!-- commands -->');
                const endOfList = commandsMarkdown.indexOf('##', startOfList + 1); // Find the next markdown header
                
                // Extract the commands list
                let commandsListSection = commandsMarkdown.substring(startOfList, endOfList !== -1 ? endOfList : undefined).trim();
                
                if (!commandsListSection) {
                    return res.status(404).json({ message: 'Commands list not found' });
                }
                // Replace <!-- commands --> with ## Commands
                commandsListSection = commandsListSection.replace('<!-- commands -->', '## Commands');

                const htmlContent = md.render(commandsListSection);
                return res.send(htmlContent);
            }                                              

            const sections = commandsMarkdown.split('##');
            const commandString = commands.join(' ').toLowerCase();
            const commandSection = sections.find(section => section.trim().toLowerCase().startsWith(`\`${commandString}\``));

            if (!commandSection) {
                return res.status(404).json({ message: 'Help information not found' });
            }

            const htmlContent = md.render(`##${commandSection}`);
            return res.send(htmlContent);
        });
        
        return router;
    }
}