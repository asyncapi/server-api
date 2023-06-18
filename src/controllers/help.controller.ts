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
        return { data: response.data, error: null };
    } catch (error) {
        console.error(`Error fetching commands: ${error}`);
        return { data: null, error };
    }
};

export class HelpController implements Controller {
    public basepath = '/help';

    public boot(): Router {
        const router: Router = Router();

        router.get(this.basepath, async (req: Request, res: Response) => {
            const command = req.body.command ? req.body.command.trim() : null;
        
            const { data: commandsMarkdown, error } = await fetchCommands('asyncapi', 'server-api');
        
            if (error) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    const statusCode = error.response.status;
                    
                    switch (statusCode) {
                        case 401:
                            return res.status(statusCode).json({ message: 'Unauthorized: Please check your GitHub API credentials.' });
                        case 403:
                            return res.status(statusCode).json({ message: 'Forbidden: You do not have permission to access this resource on GitHub.' });
                        case 404:
                            return res.status(statusCode).json({ message: 'Not Found: The requested GitHub repository or file could not be found.' });
                        case 429:
                            return res.status(statusCode).json({ message: 'Too Many Requests: You have exceeded the GitHub API rate limits.' });
                        case 500:
                            return res.status(statusCode).json({ message: 'Internal Server Error: Something went wrong on the GitHub server.' });
                        case 502:
                            return res.status(statusCode).json({ message: 'Bad Gateway: There was a problem with the gateway or proxy server on GitHub.' });
                        case 503:
                            return res.status(statusCode).json({ message: 'Service Unavailable: The GitHub service is currently unavailable. Please try again later.' });
                        default:
                            return res.status(statusCode).json({ message: error.response.data.message || 'Error fetching help information' });
                    }
                } else if (error.request) {
                    // The request was made but no response was received
                    return res.status(500).json({ message: 'No response received from GitHub API' });
                } else {
                    // Something happened in setting up the request that triggered an Error
                    return res.status(500).json({ message: 'Error in sending request to GitHub API' });
                }
            }

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