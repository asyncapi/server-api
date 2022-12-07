import { Request, Response, Router } from 'express';
import { Controller } from '../interfaces';
import { AsyncAPIDocument } from '@asyncapi/parser';

import { validationMiddleware } from '../middlewares/validation.middleware';

export class ShareController implements Controller {
  public basepath = '/share';
  
  private async share(req: Request, res: Response) {
    console.log(req);
    const stringified = AsyncAPIDocument.stringify(
      req.asyncapi?.parsedDocument
    );
    res.status(200).json({
      parsed: stringified,
    });
  }

  public async boot(): Promise<Router> {
    const router = Router();
    router.post(
      `${this.basepath}`,
      await validationMiddleware({
        path: this.basepath,
        method: 'post',
        documents: ['asyncapi'],
      }),
      this.share.bind(this)
    );

    return router;
  }
}
