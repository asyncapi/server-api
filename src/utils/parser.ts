import { Parser } from '@asyncapi/parser';
import { OpenAPISchemaParser } from '@asyncapi/parser/cjs/schema-parser/openapi-schema-parser';
import { AvroSchemaParser } from '@asyncapi/parser/cjs/schema-parser/avro-schema-parser';
import { RamlSchemaParser } from '@asyncapi/parser/cjs/schema-parser/raml-schema-parser';
import { ProblemException } from '../exceptions/problem.exception';

import type { Request } from 'express';
import type { ParseOptions } from '@asyncapi/parser';

function createParser(): Parser {
  return new Parser({
    schemaParsers: [
      OpenAPISchemaParser(),
      AvroSchemaParser(),
      RamlSchemaParser(),
    ],
    __unstable: {
      resolver: {
        cache: false,
        resolvers: [
          {
            schema: 'file',
            canRead: true,
            read: () => '',
          }
        ]
      }
    }
  });
}

const parser = createParser();

function prepareParseOptions(req?: Request): ParseOptions {
  if (!req) {
    return;
  }

  return {
    source: req.header('x-asyncapi-base-url') || req.header('referer') || req.header('origin'),
  };
}

function tryConvertParserExceptionToProblem(diagnosticsOrError: unknown) {
  if (Array.isArray(diagnosticsOrError)) {
    return new ProblemException({
      type: 'invalid-asyncapi-document(s)',
      title: 'The provided AsyncAPI Document(s) is invalid',
      status: 400,
      diagnostics: diagnosticsOrError,
    });
  }

  return new ProblemException({
    type: 'internal-parser-error',
    title: 'Internal parser error',
    status: 500,
    detail: (diagnosticsOrError as Error).message,
  });
}

export { parser, prepareParseOptions, tryConvertParserExceptionToProblem };
