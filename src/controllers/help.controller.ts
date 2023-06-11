import { Router, Request, Response } from 'express';
import { Controller } from '../interfaces';

const helpData = {
    command1: {
        info: 'Details about command1',
        subcommand1: 'Details about command1 > subcommand1',
        subcommand2: 'Details about command1 > subcommand2'
    },
    command2: {
        info: 'Details about command2',
        subcommand1: 'Details about command2 > subcommand1',
        subcommand2: 'Details about command2 > subcommand2'
    }
};

export class HelpController implements Controller {
    public basepath = '/help';

    public boot(): Router {
        const router: Router = Router();

        router.get(this.basepath, (req: Request, res: Response) => {
            const command = req.body.command;

            if (!command) {
                return res.status(400).json({ message: 'Command parameter is required' });
            }

            const subCommands = command.split('.');
            let currentData: any = helpData;

            for (const subCommand of subCommands) {
                currentData = currentData[subCommand];

                if (!currentData) {
                    return res.status(404).json({ message: 'Help information not found' });
                }
            }

            res.json(currentData);
        });

        return router;
    }
}
