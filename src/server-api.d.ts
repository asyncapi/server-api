import { AsyncAPIDocument } from '@asyncapi/parser';

declare module 'express' {
  export interface Request {
    parsedDocument?: AsyncAPIDocument;
  }
}