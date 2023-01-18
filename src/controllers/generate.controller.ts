import fs from 'fs';
import path from 'path';
import { NextFunction, Request, Response, Router } from 'express';
import Ajv from 'ajv';

import { Controller } from '../interfaces';

import { validationMiddleware } from '../middlewares/validation.middleware';

import { ArchiverService } from '../services/archiver.service';
import { GeneratorService } from '../services/generator.service';

import { ProblemException } from '../exceptions/problem.exception';
import { prepareParserConfig } from '../utils/parser';

/**
 * Controller which exposes the Generator functionality
 */
export class GenerateController implements Controller {
  public basepath = '/generate';

  private archiverService = new ArchiverService();
  private generatorService = new GeneratorService();
  private ajv: Ajv;

  private async generate(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateTemplateParameters(req);
    } catch (err) {
      return next(err);
    }

    const zip = this.archiverService.createZip(res);

    let tmpDir: string;
    try {
      tmpDir = await this.archiverService.createTempDirectory();
      const { asyncapi, template, parameters } = req.body;

      try {
        await this.generatorService.generate(
          asyncapi,
          template,
          parameters,
          tmpDir,
          prepareParserConfig(req)
        );
      } catch (genErr: unknown) {
        return next(
          new ProblemException({
            type: 'internal-generator-error',
            title: 'Internal Generator error',
            status: 500,
            detail: (genErr as Error).message,
          })
        );
      }

      this.archiverService.appendDirectory(zip, tmpDir, 'template');
      this.archiverService.appendAsyncAPIDocument(zip, asyncapi);

      res.status(200);
      return await this.archiverService.finalize(zip);
    } catch (err: unknown) {
      return next(
        new ProblemException({
          type: 'internal-server-error',
          title: 'Internal server error',
          status: 500,
          detail: (err as Error).message,
        })
      );
    } finally {
      this.archiverService.removeTempDirectory(tmpDir);
    }
  }

  private async validateTemplateParameters(req: Request) {
    const { template, parameters } = req.body;

    const validate = await this.getAjvValidator(template);
    const valid = validate(parameters || {});
    const errors = validate.errors && [...validate.errors];

    if (valid === false) {
      throw new ProblemException({
        type: 'invalid-template-parameters',
        title: 'Invalid Generator Template parameters',
        status: 422,
        validationErrors: errors as any,
      });
    }
  }

  /**
   * Retrieve proper AJV's validator function, create or reuse it.
   */
  public async getAjvValidator(templateName: string) {
    let validate = this.ajv.getSchema(templateName);
    if (!validate) {
      this.ajv.addSchema(
        await this.serializeTemplateParameters(templateName),
        templateName
      );
      validate = this.ajv.getSchema(templateName);
    }
    return validate;
  }

  /**
   * Serialize template parameters. Read all parameters from template's package.json and create a proper JSON Schema for validating parameters.
   */
  public async serializeTemplateParameters(
    templateName: string
  ): Promise<object> {
    const pathToPackageJSON = path.join(
      __dirname,
      `../../node_modules/${templateName}/package.json`
    );
    const packageJSONContent = await fs.promises.readFile(
      pathToPackageJSON,
      'utf-8'
    );
    const packageJSON = JSON.parse(packageJSONContent);
    if (!packageJSON) {
      return;
    }

    const generator = packageJSON.generator;
    if (!generator || !generator.parameters) {
      return;
    }

    const parameters = generator.parameters || {};
    const required: string[] = [];
    for (const parameter in parameters) {
      // at the moment all parameters have to be passed to the Generator instance as string
      parameters[String(parameter)].type = 'string';
      if (parameters[String(parameter)].required) {
        required.push(parameter);
      }
      delete parameters[String(parameter)].required;
    }

    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: parameters,
      required,
      // don't allow non supported properties
      additionalProperties: false,
    };
  }

  public async boot(): Promise<Router> {
    this.ajv = new Ajv({
      inlineRefs: true,
      allErrors: true,
      schemaId: 'id',
      logger: false,
    });
    const router = Router();

    router.post(
      `${this.basepath}`,
      await validationMiddleware({
        path: this.basepath,
        method: 'post',
        documents: ['asyncapi'],
      }),
      this.generate.bind(this)
    );

    return router;
  }
}
