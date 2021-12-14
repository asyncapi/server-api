import { ParserError } from '@asyncapi/parser';
import { Request, Response, NextFunction } from 'express';
import { ProblemException } from '../exceptions/problem.exception';

import { parse, prepareParserConfig } from '../utils/parser';

/**
 * Validate sent AsyncAPI document.
 */
export async function documentValidationMiddleware(req: Request, _: Response, next: NextFunction) {
  try {
    const { asyncapi } = req.body;
    if (asyncapi === undefined) {
      return next();
    }

    const parsedDocument = await parse(asyncapi, prepareParserConfig(req));
    req.parsedDocument = parsedDocument;
    next();
  } catch (err: any) {
    let error = err;
    if (error instanceof ParserError) {
      const typeName = err.type.replace('https://github.com/asyncapi/parser-js/', '');
      error = new ProblemException({
        type: typeName,
        title: err.title,
        status: retrieveStatusCode(typeName),
      });

      if (err.detail) {
        error.detail = err.detail;
      }
      if (err.validationErrors) {
        error.validationErrors = err.validationErrors;
      }
      if (err.parsedJSON) {
        error.parsedJSON = err.parsedJSON;
      }
      if (err.location) {
        error.location = err.location;
      }
      if (err.refs) {
        error.refs = err.refs;
      }
    }

    next(error);
  }
};

const TYPES_400 = [
  'null-or-falsey-document',
  'impossible-to-convert-to-json',
  'invalid-document-type',
  'invalid-json',
  'invalid-yaml',  
];

/**
 * Some error types have to be treated as 400 HTTP Status Code, another as 422.
 */
function retrieveStatusCode(type: string): number {
  if (TYPES_400.includes(type)) {
    return 400;
  }
  return 422;
}
