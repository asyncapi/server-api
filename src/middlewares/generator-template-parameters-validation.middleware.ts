import { ParserError } from '@asyncapi/parser';
import { Request, Response, NextFunction } from 'express';
import { ProblemException } from '../exceptions/problem.exception';

import { parse } from '../utils/parser';

export async function generatorTemplateParametersValidationMiddleware(req: Request, _: Response, next: NextFunction) {
  try {
    
  } catch(err: unknown) {
    next(err);
  }
};

