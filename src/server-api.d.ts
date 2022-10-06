import { AsyncAPIDocumentInterface } from '@asyncapi/parser';

declare module 'express' {
  export interface Request {
    asyncapi?: {
      parsedDocument?: AsyncAPIDocumentInterface;
      parsedDocuments?: Array<AsyncAPIDocumentInterface>;
    },
  }
}