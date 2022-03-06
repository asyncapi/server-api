import { NextFunction, Request, Response, Router } from 'express';
import Ajv from 'ajv';
import { ProblemException } from '../exceptions/problem.exception';
import { Controller} from '../interfaces';

import { documentValidationMiddleware } from '../middlewares/document-validation.middleware';
import { DiffService } from '../services/diff.service';


export class DiffController implements Controller {
    public basepath = '/diff';
    private ajv: Ajv;
    diffService: DiffService;
    private async difference(req: Request, res: Response, next: NextFunction) {
        try {
            await this.validateDiffDocumentsPath(req.body);
        } catch (err) {
            return next(new ProblemException({
                type: 'invalid-diff-documents-path',
                title: 'Invalid diff documents path',
                status: 400,
                detail: err.message,
                }));
        }
        const { asyncapi, other } = req.body;
        const output = await (await this.diffService.diff(asyncapi, other)).getOutput();
        console.log(output);
        res.status(200).json(output);
    }
    private async validateDiffDocumentsPath(body: any) {
        const validate = this.ajv.compile({
            type: 'object',
            properties: {
                asyncapi: {
                    type: 'string',
                },   
                other: {
                    type: 'string',
                },  
            },
            required: ['asyncapi', 'other'],
        });
        const valid = validate(body);
        if (!valid) {
            throw new Error(`Invalid request body: ${JSON.stringify(validate.errors)}`);
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