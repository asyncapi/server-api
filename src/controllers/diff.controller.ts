import { NextFunction, Request, Response, Router } from 'express';
import { Controller} from '../interfaces';

import { documentValidationMiddleware } from '../middlewares/document-validation.middleware';
import { DiffService } from '../services/diff.service';


export class DiffController implements Controller {
    public basepath = '/diff';
    diffService: DiffService;
    private async difference(req: Request, res: Response, next: NextFunction) {
        const { asyncapis } = req.body;
        const output = await (await this.diffService.diff(asyncapis[0],asyncapis[1])).getOutput();
        console.log(output);
        res.status(200).json(output);
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