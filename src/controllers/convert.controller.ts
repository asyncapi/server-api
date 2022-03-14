import { NextFunction, Request, Response, Router } from 'express';

import { AsyncAPIDocument } from '@asyncapi/parser';

import { Controller, SpecsEnum } from '../interfaces';

import { documentValidationMiddleware } from '../middlewares/document-validation.middleware';

import { ConvertService } from '../services/convert.service';

import { ProblemException } from '../exceptions/problem.exception';
import { parse, prepareParserConfig } from '../utils/parser';

type ConvertRequestDto = {
  /**
   * Spec version to upgrade to.
   * Default is 'latest'.
   */
  version?: SpecsEnum;
  /**
   * Language to convert the file to.
   */
  language?: 'json' | 'yaml' | 'yml',
  asyncapi: AsyncAPIDocument
}

/**
 * Controller which exposes the Convert functionality
 */
export class ConvertController implements Controller {
  public basepath = '/convert';

  private convertService = new ConvertService();

  private async convert(req: Request, res: Response, next: NextFunction) {
    try {
      const { version, language, asyncapi } = req.body as ConvertRequestDto;

      await parse(asyncapi, prepareParserConfig(req));
      const convertedSpec = await this.convertService.convertSpec(
        asyncapi,
        language,
        version.toString(),
      );

      res.json({
        asyncapi: convertedSpec
      });
    } catch (err: unknown) {
      if (err instanceof ProblemException) {
        return next(err);
      }

      return next(new ProblemException({
        type: 'internal-server-error',
        title: 'Internal server error',
        status: 500,
        detail: (err as Error).message,
      }));
    }
  }

  public boot(): Router {
    const router = Router();

    router.post(
      `${this.basepath}`,
      documentValidationMiddleware,
      this.convert.bind(this)
    );

    return router;
  }
}
