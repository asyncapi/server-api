import { NextFunction, Request, Response, Router } from 'express';

import { Controller } from '../interfaces';

import { ParserService } from '../services/parser.service';

import { ProblemException } from '../exceptions/problem.exception';
import { prepareParserConfig, handleParserError } from '../utils/parser';

/**
 * Controller which exposes the Parser functionality, to validate the AsyncAPI document.
 */
export class ValidateController implements Controller {
  public basepath = '/validate';

  private parserService = new ParserService();

  private async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const { asyncapi } = req.body;

      if (asyncapi === null) {
        return next(new ProblemException({
          type: 'null-or-falsey-document',
          title: 'Bad Request',
          status: 400,
          detail: 'The "asyncapi" field in the request payload is required.',
        }));
      }

      const options = prepareParserConfig(req);
      await this.parserService.parse(JSON.stringify(asyncapi), options);

      res.status(200).end();
    } catch (err: unknown) {
      const error = handleParserError(err);
      return next(error);
    }
  }

  public boot(): Router {
    const router = Router();

    router.post(
      `${this.basepath}`,
      this.validate.bind(this)
    );

    return router;
  }
}
