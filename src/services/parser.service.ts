import path from 'path';

import { registerSchemaParser, parse, ParserError } from '@asyncapi/parser';
import { ProblemException } from '../exceptions/problem.exception';

import ramlDtParser from '@asyncapi/raml-dt-schema-parser';
import openapiSchemaParser from '@asyncapi/openapi-schema-parser';
import avroSchemaParser from '@asyncapi/avro-schema-parser';

import { retrieveDocument } from '../utils/retrieve-document';

import type { Request } from 'express';
import type { ParserOptions } from '@asyncapi/parser';
import type { AsyncAPIDocument, ParsedAsyncAPIDocument, References } from '../interfaces';

registerSchemaParser(openapiSchemaParser);
registerSchemaParser(ramlDtParser);
registerSchemaParser(avroSchemaParser);

/**
 * Service providing `@asyncapi/parser` functionality.
 */
export class ParserService {
  private TYPES_400 = [
    'null-or-falsey-document',
    'impossible-to-convert-to-json',
    'invalid-document-type',
    'invalid-json',
    'invalid-yaml',
  ];

  public async parse(
    asyncapi: string | AsyncAPIDocument | { document: string | AsyncAPIDocument, references: References },
    req: Request,
  ): Promise<ParsedAsyncAPIDocument> {
    const { document, references } = retrieveDocument(asyncapi);

    let documentCopy = document;
    if (typeof document === 'object') {
      documentCopy = JSON.parse(JSON.stringify(document));
    }
    const options = ParserService.createConfig(req, references);

    try {
      const parsed = await parse(documentCopy, options);
      return {
        parsed,
        raw: document,
      };
    } catch (err: unknown) {
      throw this.tryConvertToProblem(err);
    }
  }

  private tryConvertToProblem(err: any) {
    let error = err;
    if (error instanceof ParserError) {
      const typeName = err.type.replace('https://github.com/asyncapi/parser-js/', '');
      error = new ProblemException({
        type: typeName,
        title: err.title,
        status: this.retrieveStatusCode(typeName),
      });
      this.mergeParserError(error, err);
    }
    return error;
  }

  private retrieveStatusCode(type: string): number {
    if (this.TYPES_400.includes(type)) {
      return 400;
    }
    return 422;
  }
  
  /**
   * Merges fields from ParserError to ProblemException.
   */
  private mergeParserError(error: ProblemException, parserError: any): ProblemException {
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

  static createConfig(req: Request = undefined, references: References = {}): ParserOptions {
    if (!req) {
      return {
        resolve: {
          file: false,
        },
      };
    }

    let fileResolver: any = false;
    if (Object.keys(references).length) {
      const serializeRefs = Object.entries(references).reduce((acc, [ref, value]) => {
        acc[path.resolve(process.cwd(), ref)] = value;
        return acc;
      }, {} as References);

      fileResolver = {
        canRead(file: { url: string }) {
          return serializeRefs[String(file.url)] !== undefined;
        },
        read(file: { url: string }) {
          return serializeRefs[String(file.url)];
        }
      };
    }

    return {
      resolve: {
        file: fileResolver,
      },
    };
  }
}
