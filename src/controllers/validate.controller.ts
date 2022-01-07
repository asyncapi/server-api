import { NextFunction, Request, Response, Router } from 'express';

import { Controller } from '../interfaces';

import { ParserService } from '../services/parser.service';

import { prepareParserConfig, tryConvertToProblemException } from '../utils/parser';

/**
 * Controller which exposes the Parser functionality, to validate the AsyncAPI document.
 */
export class ValidateController implements Controller {
  public basepath = '/validate';

  private parserService = new ParserService();

  private async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const options = prepareParserConfig(req);
      await this.parserService.parse(req.body?.asyncapi, options);

      res.status(204).end();
    } catch (err: unknown) {
      return next(tryConvertToProblemException(err));
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
