import { NextFunction, Request, Response, Router } from 'express';
import { Optimizer } from '@asyncapi/optimizer';

import { validationMiddleware } from '../middlewares/validation.middleware';

import { ProblemException } from '../exceptions/problem.exception';
import { Controller } from '../interfaces';

/**
 * Controller which exposes the Optimizer functionality.
 */
export class OptimizeController implements Controller {
  public basepath = '/optimize';

  private async optimize(req: Request, res: Response, next: NextFunction) {
    const { asyncapi, rules = {}, report = false } = req.body;

    try {
      const optimizer = new Optimizer(asyncapi);

      const result: Record<string, any> = {
        optimized: JSON.parse(optimizer.getOptimizedDocument({ rules, output: 'JSON' as any })),
      };
  
      if (report) {
        result.report = await optimizer.getReport();
      }
  
      res.status(200).json(result);
    } catch (err: unknown) {
      return next(new ProblemException({
        type: 'internal-optimizer-error',
        title: 'Internal Optimizer error',
        status: 500,
        detail: (err as Error).message,
      }));
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
      this.optimize.bind(this)
    );

    return router;
  }
}