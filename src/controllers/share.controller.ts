import { Request, Response, Router, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Controller } from '../interfaces';
import { AsyncAPIDocument } from '@asyncapi/parser';
import { validationMiddleware } from '../middlewares/validation.middleware';
import Data from '../models/data';
import { ProblemException } from '../exceptions/problem.exception';

export class ShareController implements Controller {
  public basepath = '/share';

  private async share(req: Request, res: Response, next: NextFunction) {
    const stringifiedSpec = AsyncAPIDocument.stringify(
      req.asyncapi?.parsedDocument
    );

    const docId = uuidv4();
    try {
      let data = await Data.findOne({ spec: stringifiedSpec });
      if (data) {
        res.status(201).json({
          url: `https://studio.asyncapi.com/${data.docId}`,
        });
      } else {
        data = new Data({
          doc: stringifiedSpec,
          docId,
          date: Date.now(),
        });
        await data.save();
        res.status(201).json({
          url: `https://studio.asyncapi.com/${docId}`,
        });
      }
    } catch (error: unknown) {
      return next(
        new ProblemException({
          type: 'internal-generator-error',
          title: 'Internal Generator error',
          status: 500,
          detail: (error as Error).message,
        })
      );
    }
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
