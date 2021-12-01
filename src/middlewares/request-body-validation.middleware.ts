// @ts-ignore
import fs from "fs";
// @ts-ignore
import path from "path";

import Ajv from 'ajv';
import YAML from 'js-yaml';
import $RefParser from '@apidevtools/json-schema-ref-parser';

import { Request, Response, NextFunction } from 'express';
import { ProblemException } from '../exceptions/problem.exception';;

export async function requestBodyValidationMiddleware(req: Request, _: Response, next: NextFunction) {
  try {
    const validate = await getValidator(req);
    if (validate === undefined) {
      return next();
    }

    const valid = validate(req.body);
    const errors = validate.errors && [...validate.errors];

    if (valid === false) {
      throw new ProblemException({
        type: 'invalid-request-body',
        title: 'Invalid Request Body',
        status: 422,
        validationErrors: errors as any,
      });
    }

    next();
  } catch (err: unknown) {
    next(err);
  }
};

const ajv = new Ajv({
  inlineRefs: true,
  allErrors: true,
  schemaId: 'id',
  logger: false,
});

async function getValidator(req: Request) {
  const { path: reqPath, method } = req;
  const schemaName = `${reqPath}->${method}`;

  const validate = ajv.getSchema(schemaName);
  if (validate) {
    return validate;
  }

  const appOpenAPI = await getAppOpenAPI();
  const paths = appOpenAPI.paths;

  const path = paths[reqPath];
  if (!path) {
    return undefined;
  }
  const pathMethod = path[method.toLowerCase()];
  if (!pathMethod) {
    return undefined;
  }
  const requestBody = pathMethod.requestBody;
  if (!requestBody) {
    return undefined;
  }
  const schema = requestBody.content['application/json'].schema;

  // asyncapi is validated in another middleware
  if (schema.properties && schema.properties.asyncapi) {
    schema.properties.asyncapi = {};
  }
  schema['$schema'] = 'http://json-schema.org/draft-07/schema#';

  ajv.addSchema(schema, schemaName);
  return ajv.getSchema(schemaName);
}

let parsedOpenAPI = undefined;
async function getAppOpenAPI(): Promise<any> {
  if (parsedOpenAPI) {
    return parsedOpenAPI;
  }
  
  let openaAPI = fs.readFileSync(path.join(__dirname, '../../openapi.yaml'), 'utf-8');
  parsedOpenAPI = YAML.load(openaAPI)
  const refParser = new $RefParser;
  await refParser.dereference(parsedOpenAPI);

  return parsedOpenAPI;
}
