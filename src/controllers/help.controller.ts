import { Router, Request, Response, NextFunction } from 'express';
import { Controller } from '../interfaces';
import axios from 'axios';
import yaml from 'js-yaml';
import { ProblemException } from '../exceptions/problem.exception';

export const fetchCommands = async (user, repo) => {
    try {
        const url = `https://api.github.com/repos/${user}/${repo}/contents/openapi.yaml`;
        const response = await axios.get(url, {
            headers: {
                Accept: 'application/vnd.github.v3.raw'
            }
        });
        return yaml.load(response.data);
    } catch (error) {
        console.error(`Error fetching commands: ${error}`);
        throw new ProblemException({
            type: 'fetch-commands-error',
            title: 'Error Fetching Commands',
            status: 500,
            detail: error.message
        });
    }
};

const resolveRefs = (obj, openapiSpec) => {
    if (obj instanceof Object) {
        for (let key in obj) {
            if (obj[key]?.["$ref"]) {
                const componentKey = obj[key].$ref.replace('#/components/schemas/', '');
                if (componentKey === 'AsyncAPIDocument') {
                    obj[key] = {
                        "$ref": "https://github.com/asyncapi/spec/blob/master/spec/asyncapi.md#asyncapi-object"
                    };
                } else {
                    obj[key] = openapiSpec.components.schemas[componentKey];
                }
            } else {
                resolveRefs(obj[key], openapiSpec);
            }
        }
    }
};

const getCommandsFromRequest = (req: Request): string[] => {
    return req.params[0] ? req.params[0].split('/').filter(cmd => cmd.trim()) : [];
}

const getPathKeysMatchingCommands = (commands: string[], pathKeys: string[]): string | undefined => {
    return pathKeys.find(pathKey => {
        const pathParts = pathKey.split('/').filter(part => part !== '');
        if (pathParts.length !== commands.length) return false;
        for (let i = 0; i < pathParts.length; i++) {
            const pathPart = pathParts[i];
            const command = commands[i];
            if (pathPart !== command && !pathPart.startsWith('{')) {
                return false;
            }
        }
        return true;
    });
}

const buildResponseObject = (matchedPathKey: string, method: string, operationDetails: any, requestBodyComponent: any) => {
    return {
        command: matchedPathKey,
        method: method.toUpperCase(),
        summary: operationDetails.summary || '',
        requestBody: requestBodyComponent
    };
}

export class HelpController implements Controller {
    public basepath = '/help';

    public async boot(): Promise<Router> {
        const router: Router = Router();

        router.get(/^\/help(\/.*)?$/, async (req: Request, res: Response, next: NextFunction) => {
            const commands = getCommandsFromRequest(req);
            let openapiSpec: any;

            try {
                openapiSpec = await fetchCommands('asyncapi', 'server-api');
            } catch (err) {
                return next(err);
            }

            if (commands.length === 0) {
                const routes = Object.keys(openapiSpec.paths).map(path => ({ command: path.replace(/^\//, ''), url: `${this.basepath}${path}` }));
                return res.json(routes);
            }

            const pathKeys = Object.keys(openapiSpec.paths);
            const matchedPathKey = getPathKeysMatchingCommands(commands, pathKeys);
            if (!matchedPathKey) {
                return next(new ProblemException({
                    type: 'invalid-asyncapi-command',
                    title: 'Invalid AsyncAPI Command',
                    status: 404,
                    detail: 'The given AsyncAPI command is not valid.'
                }));
            }

            const pathInfo = openapiSpec.paths[matchedPathKey];
            const method = commands.length > 1 ? 'get' : 'post';
            const operationDetails = pathInfo[method];
            if (!operationDetails) {
                return next(new ProblemException({
                    type: 'invalid-asyncapi-command',
                    title: 'Invalid AsyncAPI Command',
                    status: 404,
                    detail: 'The given AsyncAPI command is not valid.'
                }));
            }

            const { requestBody } = operationDetails;
            let requestBodyComponent: any = {};
            if (requestBody?.content?.['application/json']) {
                const { $ref } = requestBody.content['application/json'].schema;
                if ($ref) {
                    const componentKey = $ref.replace('#/components/schemas/', '');
                    requestBodyComponent = openapiSpec.components.schemas[componentKey];
                }
            }

            resolveRefs(requestBodyComponent, openapiSpec);
            return res.json(buildResponseObject(matchedPathKey, method, operationDetails, requestBodyComponent));
        });

        return router;
    }
}