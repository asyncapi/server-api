import { NextFunction, Request, Response } from 'express';

import { ProblemException } from '../exceptions/problem.exception';
import { logger } from '../utils/logger';

export function problemMiddleware(error: ProblemException, req: Request, res: Response, next: NextFunction) {
  try {
    const status = error.status = error.status || 500;
    error.title = error.title || 'Internal server error';

    logger.error(`[${req.method}] ${req.path} >> Status:: ${status}, Type:: ${error.type?.replace('https://api.asyncapi.com/problem/', '')}, Title:: ${error.title}, Detail:: ${error.detail}`);

    const problem = ProblemException.toJSON(error, status >= 500);
    res.status(status).json(problem);
  } catch (err: unknown) {
    next(err);
  }
};
