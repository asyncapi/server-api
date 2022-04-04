import type { ParsedAsyncAPIDocument } from './interfaces';

declare module 'express' {
  export interface Request {
    asyncapi: {
      documents: Record<string, ParsedAsyncAPIDocument | Array<ParsedAsyncAPIDocument>>;
    };
  }
}