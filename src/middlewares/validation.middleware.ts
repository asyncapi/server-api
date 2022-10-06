import { hasErrorDiagnostic } from '@asyncapi/parser/cjs/utils';
import { ProblemException } from '../exceptions/problem.exception';
import { createAjvInstance } from '../utils/ajv';
import { getAppOpenAPI } from '../utils/app-openapi';
import { parser, prepareParseOptions, tryConvertParserExceptionToProblem } from '../utils/parser';

import type { Request, Response, NextFunction } from 'express';
import type { AsyncAPIDocumentInterface, ParseOptions, Diagnostic } from '@asyncapi/parser';
import type { ValidateFunction } from 'ajv';

export interface ValidationMiddlewareOptions {
  path: string;
  method: 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head',
  documents?: Array<string>;
  version?: 'v1';
}

const ajvInstance = createAjvInstance();

/**
 * Create AJV's validator function for given path in the OpenAPI document.
 */
async function compileAjv(options: ValidationMiddlewareOptions) {
  const appOpenAPI = await getAppOpenAPI();
  const paths = appOpenAPI.paths || {};

  const pathName = options.path;
  const methodName = options.method;

  const validatorKey = `${pathName}->${methodName}`;
  const validate = ajvInstance.getSchema(validatorKey);
  if (validate) return validate;

  const path = paths[String(pathName)];
  if (!path) {
    throw new Error(`Path "${pathName}" doesn't exist in the OpenAPI document.`);
  }
  
  const method = path[String(methodName)];
  if (!method) {
    throw new Error(`Method "${methodName}" for "${pathName}" path doesn't exist in the OpenAPI document.`);
  }

  const requestBody = method.requestBody;
  if (!requestBody) return;

  let schema = requestBody.content['application/json'].schema;
  if (!schema) return;

  schema = { ...schema }; // shallow copy
  schema['$schema'] = 'http://json-schema.org/draft-07/schema';

  if (options.documents && schema.properties) {
    schema.properties = { ...schema.properties };
    options.documents.forEach(field => {
      if (schema.properties[String(field)].items) {
        schema.properties[String(field)] = { ...schema.properties[String(field)] };
        schema.properties[String(field)].items = true;
      } else {
        schema.properties[String(field)] = true;
      }
    });
  }

  ajvInstance.addSchema(schema, validatorKey);
  return ajvInstance.getSchema(validatorKey);
}

async function validateRequestBody(validate: ValidateFunction, body: any) {
  const valid = validate(body);
  const errors = validate.errors && [...validate.errors];

  if (valid === false) {
    throw new ProblemException({
      type: 'invalid-request-body',
      title: 'Invalid Request Body',
      status: 422,
      validationErrors: errors as any,
    });
  }
}

async function validateSingleDocument(asyncapi: string | AsyncAPIDocumentInterface, parseConfig: ParseOptions) {
  if (typeof asyncapi === 'object') {
    asyncapi = JSON.parse(JSON.stringify(asyncapi));
  }
  return parser.parse(asyncapi, parseConfig);
}

async function validateListDocuments(asyncapis: Array<string | AsyncAPIDocumentInterface>, parseConfig: ParseOptions) {
  const parsedDocuments: Array<AsyncAPIDocumentInterface> = [];
  const allDiagnostics: Array<Diagnostic> = [];
  for (const asyncapi of asyncapis) {
    const { document, diagnostics } = await validateSingleDocument(asyncapi, parseConfig);
    parsedDocuments.push(document);
    allDiagnostics.push(...diagnostics);
  }
  return { documents: parsedDocuments, diagnostics: allDiagnostics };
}

/**
 * Validate RequestBody and sent AsyncAPI document(s) for given path and method based on the OpenAPI Document.
 */
export async function validationMiddleware(options: ValidationMiddlewareOptions) {
  options.version = options.version || 'v1';
  const validate = await compileAjv(options);
  const documents = options.documents;

  return async function (req: Request, _: Response, next: NextFunction) {
    // validate request body
    try {
      await validateRequestBody(validate, req.body);
    } catch (err: unknown) {
      return next(err);
    }

    // validate AsyncAPI document(s)
    const parserConfig = prepareParseOptions(req);
    let _diagnostics: Diagnostic[] = [];
    try {
      req.asyncapi = req.asyncapi || {};
      for (const field of documents) {
        const body = req.body[String(field)];

        if (Array.isArray(body)) {
          const { documents, diagnostics } = await validateListDocuments(body, parserConfig);
          req.asyncapi.parsedDocuments = documents;
          _diagnostics = diagnostics;
        } else {
          const { document, diagnostics } = await validateSingleDocument(body, parserConfig);
          req.asyncapi.parsedDocument = document;
          _diagnostics = diagnostics;
        }
      }

      if (hasErrorDiagnostic(_diagnostics)) {
        return next(tryConvertParserExceptionToProblem(_diagnostics));
      }

      next();
    } catch (err: unknown) {
      return next(tryConvertParserExceptionToProblem(err));
    }
  };
}
