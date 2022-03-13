import { NextFunction, Request, Response, Router } from 'express';
import { Controller} from '../interfaces';

import { documentValidationMiddleware } from '../middlewares/document-validation.middleware';
import { diff } from '@asyncapi/diff';

export class DiffController implements Controller {
  public basepath = '/diff';
  private async difference(req: Request, res: Response, next: NextFunction) {
    const { asyncapis } = req.body;
    const output = await diff(asyncapis[0],asyncapis[1]).getOutput();
    res.status(200).json({ diff: output });
  }
    
  public boot(): Router {
    const router = Router();
    
    router.post(
      `${this.basepath}`,
      documentValidationMiddleware,
      this.difference.bind(this)
    );
    
    return router;
  }
}