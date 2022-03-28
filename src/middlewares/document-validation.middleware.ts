import { Request, Response, NextFunction } from 'express';

import { parse, prepareParserConfig, tryConvertToProblemException } from '../utils/parser';

/**
 * Validate sent AsyncAPI document.
 */
export async function documentValidationMiddleware(req: Request, _: Response, next: NextFunction) {
  try {
    let asyncapi = req.body?.asyncapi;
    if (!asyncapi) {
      return next();
    }
    if (typeof asyncapi === 'object') {
      asyncapi = JSON.parse(JSON.stringify(asyncapi));
    }

    const parsedDocument = await parse(asyncapi, prepareParserConfig(req));
    req.parsedDocument = parsedDocument;
    next();
  } catch (err: any) {
    next(tryConvertToProblemException(err));
  }
}
