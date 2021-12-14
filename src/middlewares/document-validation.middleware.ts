import { ParserError } from '@asyncapi/parser';
import { Request, Response, NextFunction } from 'express';
import { ProblemException } from '../exceptions/problem.exception';

import { parse, prepareParserConfig } from '../utils/parser';

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

/**
 * Merges fields from ParserError to ProblemException.
 */
function mergeParserError(error: ProblemException, parserError: any): ProblemException {
  if (parserError.detail) {
    error.detail = parserError.detail;
  }
  if (parserError.validationErrors) {
    error.validationErrors = parserError.validationErrors;
  }
  if (parserError.parsedJSON) {
    error.parsedJSON = parserError.parsedJSON;
  }
  if (parserError.location) {
    error.location = parserError.location;
  }
  if (parserError.refs) {
    error.refs = parserError.refs;
  }
  return error;
}

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
      mergeParserError(error, err);
    }

    next(error);
  }
}