import Ajv from 'ajv';
import { Request, Response, NextFunction } from 'express';

import { ProblemException } from '../exceptions/problem.exception';
import { getAppOpenAPI } from '../utils/app-openapi';

const ajv = new Ajv({
  inlineRefs: true,
  allErrors: true,
  schemaId: 'id',
  logger: false,
});

/**
 * Retrieve proper AJV's validator function, create or reuse it.
 */
async function getValidator(req: Request) {
  const { path: reqPath, method } = req;
  const schemaName = `${reqPath}->${method}`;

  const validate = ajv.getSchema(schemaName);
  if (validate) {
    return validate;
  }

  const appOpenAPI = await getAppOpenAPI();
  const paths = appOpenAPI.paths;

  const path = paths[String(reqPath)];
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

  const contentType = req.headers['content-type'];
  // eslint-disable-next-line security/detect-object-injection
  const schema = requestBody.content[contentType].schema;

  // asyncapi is validated in another middleware so make so annotate it as `any` type
  if (schema.properties && schema.properties.asyncapi) {
    schema.properties.asyncapi = true;
  }
  schema['$schema'] = 'http://json-schema.org/draft-07/schema#';

  ajv.addSchema(schema, schemaName);
  return ajv.getSchema(schemaName);
}

/**
 * Validate for the given request the request's body based on path definition from the OpenAPI Document.
 */
export async function requestBodyValidationMiddleware(req: Request, _: Response, next: NextFunction) {
  try {
    // Don't validate the body payload if it's the /validate path, because it'll be validated in the controller
    if (req.path === '/validate') {
      return next();
    }

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
}
