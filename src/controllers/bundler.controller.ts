import { NextFunction, Request, Response, Router } from 'express';
import { ProblemException } from '../exceptions/problem.exception';
import { Controller } from '../interfaces';
import bundler from '@asyncapi/bundler';
import { documentValidationMiddleware } from '../middlewares/document-validation.middleware';
import path from 'path';

export class BundlerController implements Controller {
  public basepath = '/bundle';
  private async bundle(req: Request, res: Response, next: NextFunction) {
    const asyncapis: Array<string> = req.body.asyncapis;
    const base = req.body.base;

    try {
      const document = await bundler(asyncapis, { base });
      const bundled = document.json();
      res.status(200).json({ bundled });
    } catch (err) {
      return next(new ProblemException({
        type: 'internal-bundler-error',
        title: 'Internal Bundler error',
        status: 500,
        detail: (err as Error).message,
      }));
    }
  }

  public boot(): Router {
    const router = Router();
    router.post(`${this.basepath}`, documentValidationMiddleware, this.bundle.bind(this));
    return router;
  }
}