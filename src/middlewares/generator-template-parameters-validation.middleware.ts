// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path from 'path';

import Ajv from 'ajv';
import { Request, Response, NextFunction } from 'express';

import { ProblemException } from '../exceptions/problem.exception';

/**
 * Validate for the given template the template's parameters.
 */
export async function generatorTemplateParametersValidationMiddleware(req: Request, _: Response, next: NextFunction) {
  try {
    const { template, parameters } = req.body;

    const validate = getValidator(template);
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

    next();
  } catch(err: unknown) {
    next(err);
  }
};

const ajv = new Ajv({
  inlineRefs: true,
  allErrors: true,
  schemaId: 'id',
  logger: false,
});

/**
 * Retrieve proper AJV's validator function, create or reuse it.
 */
function getValidator(templateName: string) {
  let validate = ajv.getSchema(templateName);
  if (!validate) {
    ajv.addSchema(serializeTemplateParameters(templateName), templateName);
    validate = ajv.getSchema(templateName);
  }
  return validate;
}

/**
 * Serialize template parameters. Read all parameters from template's package.json and serialize to proper JSON Schema.
 */
function serializeTemplateParameters(templateName: string): object {
  const packageJSON = JSON.parse(fs.readFileSync(path.join(__dirname, `../../node_modules/${templateName}/package.json`), 'utf-8'));
  if (!packageJSON) {
    return;
  }

  const generator = packageJSON.generator;
  if (!generator || !generator.parameters) {
    return;
  }

  const parameters = generator.parameters || {};
  const required: string[] = [];
  for (let parameter in parameters) {
    // at the moment all parameter have to be passed to the Generator instance as string
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
    // don't allow non supported properties
    additionalProperties: false,
  }
}
