import { Request, Response, NextFunction } from 'express';
import { ParserService } from '../services/parser.service';

import { prepareParserConfig, tryConvertToProblemException } from '../utils/parser';

const parserService = new ParserService();

/**
 * Validate sent AsyncAPI document.
 */
export async function documentValidationMiddleware(req: Request, _: Response, next: NextFunction) {
  try {
    const contentType = req.headers['content-type'];
    if (!contentType || (contentType.indexOf('application/json') !== 0 && contentType.indexOf('application/x-yaml') !== 0)) {
      return next();
    }

    const asyncapi = contentType.indexOf('application/json') >= 0 ? req.body.asyncapi : req.body;
    if (asyncapi === undefined) {
      return next();
    }

    const parsedDocument = await parserService.parse(asyncapi, prepareParserConfig(req));

    req.parsedDocument = parsedDocument;
    next();
  } catch (err: any) {
    next(tryConvertToProblemException(err));
  }
}
