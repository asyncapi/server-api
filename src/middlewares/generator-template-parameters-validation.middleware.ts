// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path from 'path';

import Ajv from 'ajv';
import { Request, Response, NextFunction } from 'express';

import { ProblemException } from '../exceptions/problem.exception';

export async function generatorTemplateParametersValidationMiddleware(req: Request, _: Response, next: NextFunction) {
  try {
    const { template, parameters } = req.body;
    if (assertTemplate(template) === false) {
      throw new ProblemException({
        type: 'unsupported-template',
        title: 'Unsupported Generator Template',
        status: 422,
      });
    }

    if (typeof parameters !== 'object') {
      return next();
    }

    const validate = getValidator(template);
    const valid = validate(parameters);
    const errors = validate.errors && [...validate.errors];

    if (valid === false) {
      throw new ProblemException({
        type: 'invalid-template-parameters',
        title: 'Invalid Generator Template parameters',
        status: 422,
        validationErrors: errors as any,
      });
    }

    next();
  } catch(err: unknown) {
    next(err);
  }
};

const SUPPORTED_TEMPLATES = [
  '@asyncapi/html-template',
  '@asyncapi/markdown-template',
];

function assertTemplate(templateName: string): boolean {
  return SUPPORTED_TEMPLATES.includes(templateName);
}

const ajv = new Ajv({
  inlineRefs: true,
  allErrors: true,
  schemaId: 'id',
  logger: false,
});

function getValidator(templateName: string) {
  let validate = ajv.getSchema(templateName);
  if (!validate) {
    ajv.addSchema(serializeTemplateParameters(templateName), templateName);
    validate = ajv.getSchema(templateName);
  }
  return validate;
}

function serializeTemplateParameters(templateName: string): object {
  const packageJSON = JSON.parse(fs.readFileSync(path.join(__dirname, `../../node_modules/${templateName}/package.json`), 'utf-8'));
  if (!packageJSON) {
    return;
  }

  const generator = packageJSON.generator;
  if (!generator || !generator.parameters) {
    return;
  }

  const parameters = generator.parameters as object;
  const required: string[] = [];
  for (let parameter in parameters) {
    parameters[parameter].type = 'string';
    if (parameters[parameter].required) {
      required.push(parameter);
    }
    delete parameters[parameter].required;
  }

  return {
    '$schema': 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: parameters,
    required,
    additionalProperties: false,
  }
}
