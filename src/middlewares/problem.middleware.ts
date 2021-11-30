import { NextFunction, Request, Response } from 'express';

import { ProblemException } from '../exceptions/problem.exception';
import { logger } from '../utils/logger';

export function problemMiddleware(error: ProblemException, req: Request, res: Response, next: NextFunction) {
  try {
    const status = error.status = error.status || 500;
    error.title = error.title || 'Something went wrong';

    logger.error(`[${req.method}] ${req.path} >> Status:: ${status}, Type:: ${error.type?.replace('https://api.asyncapi.com/problem/', '')}, Title:: ${error.title}, Detail:: ${error.title}`);
    res.status(status).json(ProblemException.toJSON(error));
  } catch (err: unknown) {
    next(err);
  }
};
