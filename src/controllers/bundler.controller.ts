import fs from 'fs';
import { NextFunction, Request, Response, Router } from 'express';
import { ProblemException } from '../exceptions/problem.exception';
import { Controller } from '../interfaces';
import bundler from '@asyncapi/bundler';
import { documentValidationMiddleware } from '../middlewares/document-validation.middleware';
import path from 'path';

export class BundlerController implements Controller {
  public basepath = '/bundle';
  private async bundle(req: Request, res: Response, next: NextFunction) {
    const asyncapis: Array<string> = req.body.asyncapis || [req.body.asyncapi];
    if (!asyncapis || !asyncapis.length) {
      throw new ProblemException({
        type: 'https://api.asyncapi.com/problem/asyncapi-missing',
        title: 'Asyncapi missing',
        detail: 'No Asyncapi provided',
        status: 400,
      });
    }
    // const bundle = await bundler(asyncapis);
    // res.send(bundle);
    try {
      const document = await bundler.bundle(asyncapis.map(asyncapi => fs.readFileSync(asyncapi)), { base: path.dirname(asyncapis[0]) });
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