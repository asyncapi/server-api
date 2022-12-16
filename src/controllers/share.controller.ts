import { Request, Response, Router, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { Controller } from '../interfaces';
import { validationMiddleware } from '../middlewares/validation.middleware';
import ShareDocument from '../models/share.model';
import { ProblemException } from '../exceptions/problem.exception';
import { logger } from '../utils/logger';
export class ShareController implements Controller {
  public basepath = '/share';

  private async initializeDatabase() {
    await mongoose
      .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/asyncapi')
      .then(() => {
        logger.info('🚀 Database connection is successful');
      })
      .catch((err) => {
        logger.error(`Database connection failed${err.message}`);
      });
  }

  private async share(req: Request, res: Response, next: NextFunction) {
    const stringifiedSpec = JSON.stringify(
      req.asyncapi
    );
    const id = uuidv4();
    try {
      const data = new ShareDocument({
        doc: stringifiedSpec,
        id,
        date: Date.now(),
      });
      await data.save();
      res.status(201).json({
        sharedID: id,
      });
    } catch (error: unknown) {
      return next(
        new ProblemException({
          type: 'internal-server-error',
          title: 'Internal Server Error',
          status: 500,
          detail: (error as Error).message,
        })
      );
    }
  }

  private async retrieve(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const result = await ShareDocument.findOne({ id });
      if (result) {
        res.status(200).json({
          document: result.doc,
        });
      } else {
        res.status(404).json('No document with id was found');
      }
    } catch (error) {
      return next(
        new ProblemException({
          type: 'internal-server-error',
          title: 'Internal Server Error',
          status: 500,
          detail: (error as Error).message,
        })
      );
    }
  }

  public async boot(): Promise<Router> {
    const router = Router();
    await this.initializeDatabase();
    router.post(
      `${this.basepath}`,
      await validationMiddleware({
        path: this.basepath,
        method: 'post',
        documents: ['asyncapi'],
      }),
      this.share.bind(this)
    );

    router.get(
      `${this.basepath}/:id`,
      await validationMiddleware({
        path: `${this.basepath}/{id}`,
        method: 'get',
      }),
      this.retrieve.bind(this)
    );
    return router;
  }
}
