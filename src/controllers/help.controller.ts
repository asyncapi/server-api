import { Router, Request, Response } from 'express';
import { Controller } from '../interfaces';
import axios from 'axios';
import yaml from 'js-yaml';

const fetchCommands = async (user, repo) => {
    try {
        const url = `https://api.github.com/repos/${user}/${repo}/contents/openapi.yaml`;
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/vnd.github.v3.raw',
            },
        });
        return yaml.load(response.data);
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
            const openapiSpec: any = await fetchCommands('asyncapi', 'server-api');

            if (!openapiSpec) {
                return res.status(500).json({ message: 'Error fetching help information' });
            }

            if (commands.length === 0) {
                const routes = Object.keys(openapiSpec.paths).map(path => ({ command: path.replace(/^\//, ''), url: `${this.basepath}${path}` }));
                return res.json(routes);
            }

            const pathKeys = Object.keys(openapiSpec.paths);
            const matchedPathKey = pathKeys.find(pathKey => {
                const pathParts = pathKey.split('/').filter(part => part !== '');
                if (pathParts.length !== commands.length) {
                    return false;
                }
                for (let i = 0; i < pathParts.length; i++) {
                    const pathPart = pathParts[i];
                    const command = commands[i];
                    if (pathPart !== command && !pathPart.startsWith('{')) {
                        return false;
                    }
                }
                return true;
            });
            
            if (!matchedPathKey) {
                return res.status(404).json({ message: 'Help information not found' });
            }

            const pathInfo = openapiSpec.paths[matchedPathKey];
            const method = commands.length > 1 ? 'get' : 'post';
            const operationDetails = pathInfo[method];

            if (!operationDetails) {
                return res.status(404).json({ message: 'Help information not found' });
            }

            const { requestBody } = operationDetails;

            let requestBodyComponent = {};

            if (requestBody && requestBody.content && requestBody.content['application/json']) {
                const { $ref } = requestBody.content['application/json'].schema;
                const componentKey = $ref.replace('#/components/schemas/', '');
                requestBodyComponent = openapiSpec.components.schemas[componentKey];
            }

            const responseObject = {
                command: matchedPathKey,
                method: method.toUpperCase(),
                summary: operationDetails.summary || '',
                description: operationDetails.description || '',
                parameters: operationDetails.parameters || [],
                requestBody: requestBodyComponent,
            };
            
            return res.json(responseObject);
        });

        return router;
    }
}
