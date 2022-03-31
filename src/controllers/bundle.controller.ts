import { NextFunction, Request, Response, Router } from 'express';
import bundler from '@asyncapi/bundler';

import { validationMiddleware } from '../middlewares/validation.middleware';

import { ProblemException } from '../exceptions/problem.exception';
import { Controller, ParsedAsyncAPIDocument } from '../interfaces';

export class BundleController implements Controller {
  public basepath = '/bundle';

  private async bundle(req: Request, res: Response, next: NextFunction) {
    const asyncapis = req.asyncapi.documents.asyncapis as Array<ParsedAsyncAPIDocument>;
    const rawAsyncapis = asyncapis.map(asyncapi => asyncapi.raw);
    const base = req.asyncapi.documents.base as ParsedAsyncAPIDocument;

    try {
      const document = await bundler(rawAsyncapis, { base: base.raw });
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

  public async boot(): Promise<Router> {
    const router = Router();

    router.post(
      this.basepath,
      await validationMiddleware({ 
        path: this.basepath, 
        method: 'post',
        documents: ['asyncapis', 'base'],
      }),
      this.bundle.bind(this)
    );

    return router;
  }
}