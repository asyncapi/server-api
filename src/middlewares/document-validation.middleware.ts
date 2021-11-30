import { ParserError } from '@asyncapi/parser';
import { Request, Response, NextFunction } from 'express';
import { ProblemException } from '../exceptions/problem.exception';

import { parse } from '../utils/parser';

export async function documentValidationMiddleware(req: Request, _: Response, next: NextFunction) {
  try {
    const { asyncapi } = req.body;
    const parsedDocument = await parse(asyncapi);
    req.parsedDocument = parsedDocument;
    next();
  } catch (err: unknown) {
    if (err instanceof ParserError) {
      const typeName = (err as any).type.replace('https://github.com/asyncapi/parser-js/', '');
      (err as any).type = ProblemException.createType(typeName);
      (err as any).status = retrieveStatusCode(typeName);
      // add validationErrors and refs fields to the output
    }
    next(err);
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