import { registerSchemaParser, parse, ParserError } from '@asyncapi/parser';
import { Request } from 'express';
import { Problem } from '../../problem_lib';
import ramlDtParser from '@asyncapi/raml-dt-schema-parser';
import openapiSchemaParser from '@asyncapi/openapi-schema-parser';
import avroSchemaParser from '@asyncapi/avro-schema-parser';

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
      }
    },
    path: req.header('x-asyncapi-base-url') || req.header('referer') || req.header('origin'),
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
function mergeParserError(error: Problem, parserError: any): Problem {
  if (parserError.detail) {
    error.detail = parserError.detail;
  }
  if (parserError.validationErrors) {
    error.validationErrors = parserError.validationErrors;
  }
  if (parserError.parsedJSON) {
    error.parsedJSON = parserError.parsedJSON;
  }
  if (parserError.location) {
    error.location = parserError.location;
  }
  if (parserError.refs) {
    error.refs = parserError.refs;
  }
  return error;
}

function tryConvertToProblemException(err: any) {
  let error = err;
  if (error instanceof ParserError) {
    const typeName = err.type.replace('https://github.com/asyncapi/parser-js/', '');
    error = new Problem({
      type: typeName,
      title: err.title,
      status: retrieveStatusCode(typeName),
    });
    mergeParserError(error, err);
  }

  return error;
}

export { prepareParserConfig, parse, mergeParserError, retrieveStatusCode, tryConvertToProblemException };
