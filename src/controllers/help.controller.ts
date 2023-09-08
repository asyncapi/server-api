import { Router, Request, Response, NextFunction } from 'express';
import { Controller } from '../interfaces';
import { ProblemException } from '../exceptions/problem.exception';
import { getAppOpenAPI } from '../utils/app-openapi';

const getCommandsFromRequest = (req: Request): string[] => {
  return req.params[0] ? req.params[0].split('/').filter(cmd => cmd.trim()) : [];
};

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
};

const getFullRequestBodySpec = (operationDetails: any) => {
  if (operationDetails?.requestBody?.content?.['application/json']) {
    return operationDetails.requestBody.content['application/json'].schema;
  }
  return null;
};

const buildResponseObject = (matchedPathKey: string, method: string, operationDetails: any, requestBodySchema: any) => {
  return {
    command: matchedPathKey,
    method: method.toUpperCase(),
    summary: operationDetails.summary || '',
    requestBody: requestBodySchema
  };
};

export class HelpController implements Controller {
  public basepath = '/help';

  public async boot(): Promise<Router> {
    const router: Router = Router();

    router.get(/^\/help(\/.*)?$/, async (req: Request, res: Response, next: NextFunction) => {
      const commands = getCommandsFromRequest(req);
      let openapiSpec: any;

      try {
        openapiSpec = await getAppOpenAPI();
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

      const requestBodySchema = getFullRequestBodySpec(operationDetails);

      return res.json(buildResponseObject(matchedPathKey, method, operationDetails, requestBodySchema));
    });

    return router;
  }
}