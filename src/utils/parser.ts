import { registerSchemaParser, parse, ParserError } from '@asyncapi/parser';
import { Request } from 'express';
import ramlDtParser from '@asyncapi/raml-dt-schema-parser';
import openapiSchemaParser from '@asyncapi/openapi-schema-parser';
import avroSchemaParser from '@asyncapi/avro-schema-parser';

import { ProblemException } from '../exceptions/problem.exception';

registerSchemaParser(openapiSchemaParser);
registerSchemaParser(ramlDtParser);
registerSchemaParser(avroSchemaParser);

function prepareParserConfig(req?: Request) {
  if (!req) {
    return {
      resolve: {
        file: false,
      },
    };
  }

  return {
    resolve: {
      file: false,
      http: {
        headers: {
          Cookie: req.header('Cookie'),
        },
        withCredentials: true,
      },
    },
    path:
      req.header('x-asyncapi-base-url') ||
      req.header('referer') ||
      req.header('origin'),
  };
}

const TYPES_400 = [
  'null-or-falsey-document',
  'impossible-to-convert-to-json',
  'invalid-document-type',
  'invalid-json',
  'invalid-yaml',
];

/**
 * Some error types have to be treated as 400 HTTP Status Code, another as 422.
 */
function retrieveStatusCode(type: string): number {
  if (TYPES_400.includes(type)) {
    return 400;
  }
  return 422;
}

/**
 * Merges fields from ParserError to ProblemException.
 */
function mergeParserError(error: ProblemException, parserError: any): ProblemException {
  if (parserError.detail) {
    error.set('detail', parserError.detail);
  }
  if (parserError.validationErrors) {
    error.set('validationErrors', parserError.validationErrors);
  }
  if (parserError.parsedJSON) {
    error.set('parsedJSON', parserError.parsedJSON);
  }
  if (parserError.location) {
    error.set('location', parserError.location);
  }
  if (parserError.refs) {
    error.set('refs', parserError.refs);
  }
  return error;
}

function tryConvertToProblemException(err: any) {
  let error = err;
  if (error instanceof ParserError) {
    const typeName = err.type.replace(
      'https://github.com/asyncapi/parser-js/',
      ''
    );
    error = new ProblemException({
      type: typeName,
      title: err.title,
      status: retrieveStatusCode(typeName),
    });
    mergeParserError(error, err);
  }

  return error;
}

export {
  prepareParserConfig,
  parse,
  mergeParserError,
  retrieveStatusCode,
  tryConvertToProblemException,
};
