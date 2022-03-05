import Ajv from 'ajv';
import {bundler} from '@asyncapi/bundler';
import { NextFunction, Request, Response, Router } from 'express';
import { Controller } from '../interfaces';
import { documentValidationMiddleware } from '../middlewares/document-validation.middleware';

export class BundlerController implements Controller {
  public basepath = '/bundle';
  private ajv:Ajv;
  private async bundle(req:Request, res:Response, next:NextFunction) {
    try {
      const result=bundler.bundle(req.body.asyncapi, req.body.template, req.body.parameters, req.body.options);
      res.status(200).json(result);
    } catch (err) {
      return next(err);
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