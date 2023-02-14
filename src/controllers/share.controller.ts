import { Request, Response, Router, NextFunction } from 'express';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import mongoose from 'mongoose';

import { validationMiddleware } from '../middlewares/validation.middleware';
import { ShareDocumentSchema, ShareDocument } from '../models';

import { ProblemException } from '../exceptions/problem.exception';
import { logger } from '../utils/logger';

import { Controller } from '../interfaces';

/**
 * Controller which saves AsyncAPI documents to the database.
 */
export class ShareController implements Controller {
  public basepath = '/share';
  private connection: mongoose.Connection;
  private shareDocumentModel: mongoose.Model<ShareDocument>;

  private async create(req: Request, res: Response, next: NextFunction) {
    const { asyncapi, expireAt } = req.body;
    const stringifiedDocument = typeof asyncapi === 'string' ? asyncapi : JSON.stringify(asyncapi);
    const id = uuidv4();
    
    try {
      const data = new this.shareDocumentModel({
        id,
        document: stringifiedDocument,
        // use expireAt value or default one (7 days)
        date: expireAt ? new Date(expireAt) : undefined,
      });

      await data.save();
      return res.status(201).json({
        id,
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
      const isValidId = uuidValidate(id);
      if (!isValidId) {
        return next(new ProblemException({
          type: 'invalid-share-id',
          title: 'The document identifier must be a valid uuid.',
          status: 400,
        }));
      }

      const result = await this.shareDocumentModel.findOne({ id });
      if (!result) {
        return next(new ProblemException({
          type: 'not-available-id',
          title: `No document with id "${id}" was found.`,
          status: 404,
        }));
      }

      return res.status(200).json({
        document: result.document,
      });
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

  private async initializeDatabase() {
    try {
      const connection = this.connection = await mongoose.createConnection(process.env.MONGODB_URI || 'mongodb://localhost:27017/asyncapi-documents').asPromise();
      this.shareDocumentModel = connection.model('ShareDocument', ShareDocumentSchema);
    } catch (err) {
      return logger.error(`Database connection failed: ${err.message}`);
    }

    logger.info('🚀 Database connection is successful');
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
      this.create.bind(this)
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

  dispose(): Promise<void> {
    return this.connection.close();
  }
}
