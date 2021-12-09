import { NextFunction, Request, Response, Router } from 'express';
import { ProblemException } from '../exceptions/problem.exception';

import { Controller } from '../interfaces';

import { generatorTemplateParametersValidationMiddleware } from "../middlewares/generator-template-parameters-validation.middleware";
import { ArchiverService } from '../services/archiver.service';
import { GeneratorService } from '../services/generator.service';
import { prepareParserConfig } from '../utils/parser';

/**
 * Controller which exposes the Generator functionality
 */
export class GeneratorController implements Controller {
  public path = '/generate';

  private archiverService = new ArchiverService();
  private generatorService = new GeneratorService();

  private async generate(req: Request, res: Response) {
    const zip = this.archiverService.createZip(res);
    this.archiverService.appendHeaders(res);

    let tmpDir: string;
    try {
      tmpDir = this.archiverService.createTempDirectory();
      const { asyncapi, template, parameters } = req.body;

      await this.generatorService.generate(
        req.parsedDocument,
        template,
        parameters,
        tmpDir,
        prepareParserConfig(req),
      );

      this.archiverService.appendDirectory(zip, tmpDir, 'template');
      this.archiverService.appendAsyncAPIDocument(zip, asyncapi);

      res.status(200);
      return await this.archiverService.finalize(zip);
    }
    catch (err: unknown) {
      throw new ProblemException({
        type: 'internal-server-error',
        title: 'Internal server error',
        status: 500,
        detail: (err as Error).message,
      });
    }
    finally {
      this.archiverService.removeTempDirectory(tmpDir);
    }
  }

  public boot(): Router {
    const router = Router();
    
    router.post(
      `${this.path}`, 
      generatorTemplateParametersValidationMiddleware, 
      this.generate.bind(this)
    );

    return router;
  }
}
