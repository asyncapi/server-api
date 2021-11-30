import { ParserError } from '@asyncapi/parser';
import { Request, Response, NextFunction } from 'express';
import { ProblemException } from '../exceptions/problem.exception';

import { parse } from '../utils/parser';

export async function documentValidationMiddleware(req: Request, _: Response, next: NextFunction) {
  try {
    const { asyncapi } = req.body;
    if (asyncapi === undefined) {
      next();
    }

    const parsedDocument = await parse(asyncapi);
    req.parsedDocument = parsedDocument;
    next();
  } catch (err: any) {
    let error = err;
    if (err instanceof ParserError) {
      const typeName = (err as any).type.replace('https://github.com/asyncapi/parser-js/', '');
      error = new ProblemException({
        type: ProblemException.createType(typeName),
        title: (err as any).title,
        status: retrieveStatusCode(typeName),
      });

      if ((err as any).detail) {
        error.detail = (err as any).detail;
      }
      if ((err as any).validationErrors) {
        error.validationErrors = (err as any).validationErrors;
      }
      if ((err as any).parsedJSON) {
        error.parsedJSON = (err as any).parsedJSON;
      }
      if ((err as any).location) {
        error.location = (err as any).location;
      }
      if ((err as any).refs) {
        error.refs = (err as any).refs;
      }
      console.log(err)
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
  'impossible-to-convert-to-json',
];

function retrieveStatusCode(type: string): number {
  if (TYPES_400.includes(type)) {
    return 400;
  }
  return 422;
}
