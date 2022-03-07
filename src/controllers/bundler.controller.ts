import Ajv from 'ajv';
import { NextFunction, Request, Response, Router } from 'express';
import { ProblemException } from '../exceptions/problem.exception';
import { Controller } from '../interfaces';
import { BundlerService } from '../services/bundler.service';
import { documentValidationMiddleware } from '../middlewares/document-validation.middleware';

export class BundlerController implements Controller {
  public basepath = '/bundle';
  private ajv:Ajv;
  bundlerService: BundlerService;
  private async bundle(req:Request, res:Response, next:NextFunction) {
    try {
      await this.validateFilesParameter(req.body.files);
      if (req.body.options) {
        await this.validateOptionsParameter(req.body.options);
      }
    } catch (err) {
      return next(err);
    }  
    const files: Array<string> = req.body.files;
    const options: any = {};
    if (req.body.options) {
      if (typeof req.body.options.base === 'string') {
        options.base = req.body.options.base;
      }
      if (typeof req.body.options.parse === 'object') {
        options.parse = req.body.options.parse;
      }
      if (typeof req.body.options.validate === 'boolean') {
        options.validate = req.body.options.validate;
      }
    }
    try {
      const document = await this.bundlerService.bundle(files,options);
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
  private async validateOptionsParameter(options: any) {
    const validate = this.ajv.compile({
      type: 'object',
      properties: {
        base: {
          type: 'string',
        },
        parse: {
          type: 'Object',
        },
        validate: {
          type: 'boolean',
        }
      },
    });
    if (!validate(options)) {
      throw new ProblemException({
        type: 'invalid-options',
        title: 'Invalid options',
        status: 400,
        detail: 'The options parameter must be an object',
        validate: validate.errors,
      });
    }
  }
  private async validateFilesParameter(files: any) {
    const validate = this.ajv.compile({
      type: 'array',
      items: {
        type: 'string',
      },
    });
    if (!validate(files)) {
      throw new ProblemException({
        type: 'invalid-files-path',
        title: 'Invalid files path',
        status: 400,
        detail: 'The files parameter must be an array of strings',
        validate: validate.errors,
      });
    }
  }

  public boot(): Router {
    this.ajv = new Ajv({
      inlineRefs: true,
      allErrors: true,
      schemaId: 'id',
      logger: false,
    });
    const router = Router();
    router.post(`${this.basepath}`,documentValidationMiddleware, this.bundle.bind(this));
    return router;
  }    
}