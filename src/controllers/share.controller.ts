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
      const data = new Data({
        doc: stringifiedSpec,
        docId,
        date: Date.now(),
      });
      await data.save();
      res.status(201).json({
        url: `https://studio.asyncapi.com/${docId}`,
      });
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

  //   private async retrieve(req: Request, res: Response, next: NextFunction) {
  //     const { id } = req.params;
  //     try {
  //       const result = await Data.findOne({docId: id});
  //       if (result) {
  //         res.status(200).json({
  //           document: result.doc
  //         });
  //       } else {
  //         res.status(404).json('No document with id was found');
  //       }
  //     } catch (error) {
  //       return next(
  //         new ProblemException({
  //           type: 'internal-generator-error',
  //           title: 'Internal Generator error',
  //           status: 500,
  //           detail: (error as Error).message,
  //         })
  //       );
  //     }
  //   }

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

    // router.get(
    //   `${this.basepath}/:id`,
    //   await validationMiddleware({
    //     path: `${this.basepath}/:id`,
    //     method: 'get',
    //   }),
    //   this.retrieve.bind(this)
    // );
    return router;
  }
}
