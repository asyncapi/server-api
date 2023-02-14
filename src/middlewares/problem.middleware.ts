import { NextFunction, Request, Response } from 'express';

import { ProblemException } from '../exceptions/problem.exception';
import { logger } from '../utils/logger';

/**
 * Catch problem exception, log it and serialize error to human readable form.
 */
export function problemMiddleware(error: ProblemException, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(error);
  }

  try {
    const status = error.status = error.status || 500;
    error.title = error.title || 'Internal server error';

    logger.error(`[${req.method}] ${req.path} >> Status:: ${status}, Type:: ${error.type?.replace('https://api.asyncapi.com/problem/', '')}, Title:: ${error.title}, Detail:: ${error.detail}`);

    const problem = ProblemException.toJSON(error, false);
    res.status(status).json(problem);
  } catch (err: unknown) {
    next(err);
  }
}
