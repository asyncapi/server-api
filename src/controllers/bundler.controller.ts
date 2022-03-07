import fs from 'fs';
import path from 'path';
import { NextFunction, Request, Response, Router } from 'express';
import { ProblemException } from '../exceptions/problem.exception';
import { Controller } from '../interfaces';
import bundler from '@asyncapi/bundler';
import { documentValidationMiddleware } from '../middlewares/document-validation.middleware';

export class BundlerController implements Controller {
  public basepath = '/bundle';
  private async bundle(req: Request, res: Response, next: NextFunction) {
    const asyncapis: Array<string> = req.body.asyncapis || [req.body.asyncapi];
    const options: any = {};
    if (req.body.options) {
      if (typeof req.body.options.base === 'string') {
        options.base = req.body.options.base;
      }
      if (typeof req.body.options.parse === 'object') {
        options.parse = req.body.options.parse;
      }
      if (typeof req.body.options.validate === 'boolean') {
        options.validate = req.body.options.validate;
      }
    }
    try {
      const document = await bundler.bundle(asyncapis.map(asyncapi => fs.readFileSync(path.resolve(asyncapi))), { base: options.base });
      res.status(200).json(document);
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