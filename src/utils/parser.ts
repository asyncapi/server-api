import { registerSchemaParser, parse } from '@asyncapi/parser';
import { Request } from 'express';

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
    }
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

export { prepareParserConfig, parse };
