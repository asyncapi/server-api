import { NextFunction, Request, Response, Router } from 'express';
import YAML from 'js-yaml';

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
  language?: string,
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

      if (!convertedSpec) {
        return next(new ProblemException({
          type: 'invalid-json',
          title: 'Bad Request',
          status: 400,
          detail: 'Couldn\'t convert the spec to the requested version.'
        }));
      }
      const convertedSpecObject = YAML.load(convertedSpec);
      res.json({
        asyncapi: convertedSpecObject
      });
    } catch (err: unknown) {
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
