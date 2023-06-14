import { Router, Request, Response } from 'express';
import { Controller } from '../interfaces';
import axios from 'axios';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

const fetchCommands = async (user, repo) => {
    try {
        const url = `https://api.github.com/repos/${user}/${repo}/contents/commands.md`;
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

        router.get(this.basepath, async (req: Request, res: Response) => {
            const command = req.body.command ? req.body.command.trim() : null;
        
            const commandsMarkdown = await fetchCommands('princerajpoot20', 'api_endpoint');
        
            if (!commandsMarkdown) {
                return res.status(500).json({ message: 'Error fetching help information' });
            }
        
            if (!command) {
                // Return information for only the list of commands
                const endOfList = commandsMarkdown.indexOf('##', commandsMarkdown.indexOf('<!-- commands -->'));
                const commandsListSection = commandsMarkdown.substring(0, endOfList).trim();
                
                if (!commandsListSection) {
                    return res.status(404).json({ message: 'Commands list not found' });
                }
                
                const htmlContent = md.render(commandsListSection);
                return res.send(htmlContent);
            }
        
            const sections = commandsMarkdown.split('##');
            const commandSection = sections.find(section => section.trim().startsWith(`\`${command}\``));
        
            if (!commandSection) {
                return res.status(404).json({ message: 'Help information not found' });
            }
        
            const htmlContent = md.render(`##${commandSection}`);
        
            return res.send(htmlContent);
        });        
        
        

        return router;
    }
}
