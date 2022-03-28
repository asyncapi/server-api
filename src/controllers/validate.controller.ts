import { Request, Response, Router } from 'express';

import { validationMiddleware } from '../middlewares/validation.middleware';

import { Controller } from '../interfaces';

/**
 * Controller which exposes the Parser functionality, to validate the AsyncAPI document.
 */
export class ValidateController implements Controller {
  public basepath = '/validate';

  private async validate(_: Request, res: Response) {
    res.status(204).end();
  }

  public async boot(): Promise<Router> {
    const router = Router();

    router.post(
      `${this.basepath}`,
      await validationMiddleware({ 
        path: this.basepath, 
        method: 'post',
        documents: {
          asyncapi: 'single',
        }
      }),
      this.validate.bind(this)
    );

    return router;
  }
}
