
import { NextFunction, Request, Response, Router } from 'express';
import Ajv from 'ajv';

import { diff } from "@asyncapi/diff";

import { Controller} from '../interfaces';

import { documentValidationMiddleware } from '../middlewares/document-validation.middleware';


export class DiffController implements Controller {
    public basepath = '/diff';
    private ajv: Ajv;

    private async difference(req: Request, res: Response, next: NextFunction) {
        try {
            const output = await diff(req.body.asyncapi, req.body.other);
            res.status(200).json(output);
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
    
        router.post(
          `${this.basepath}`,
          documentValidationMiddleware,
          this.difference.bind(this)
        );
    
        return router;
      }
}