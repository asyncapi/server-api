import { NextFunction, Request, Response, Router } from 'express';

import redoc from 'redoc-express';

import { Controller } from '../interfaces';

export class DocsController implements Controller {
  public basepath = '/docs';

  private async docs(req: Request, res: Response, next: NextFunction) {
    try { 

      await redoc({
        title: 'API Docs',
        specUrl: '.../openapi.yaml'
      });

      res.status(204).end();
    } catch (err) {
      return next(err);
    }
  }

  public boot(): Router {
    const router = Router();

    router.post(
      `${this.basepath}`,
      this.docs.bind(this)
    );

    return router;
  }
}
