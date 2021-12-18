import { Request, Response, NextFunction } from 'express';
import { ParserService } from '../services/parser.service';

import { prepareParserConfig, handleParserError } from '../utils/parser';

const parserService = new ParserService();

/**
 * Validate sent AsyncAPI document.
 */
export async function documentValidationMiddleware(req: Request, _: Response, next: NextFunction) {
  try {
    const { asyncapi } = req.body;
    if (asyncapi === undefined) {
      return next();
    }

    const parsedDocument = await parserService.parse(asyncapi, prepareParserConfig(req));

    req.parsedDocument = parsedDocument;
    next();
  } catch (err: any) {
    const error = handleParserError(err);
    next(error);
  }
}