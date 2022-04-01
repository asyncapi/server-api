import type { AsyncAPIDocument, References } from '../interfaces';

export function retrieveDocument(body: string | AsyncAPIDocument | { document: string | AsyncAPIDocument, references: References }): { document: string | AsyncAPIDocument, references: References | undefined } {
  if (typeof body === 'object' && Object.keys(body).length === 2 && body.references && typeof body.references === 'object') {
    return {
      document: body.document as string | AsyncAPIDocument,
      references: body.references as References,
    };
  }
  return {
    document: body as string | AsyncAPIDocument,
    references: undefined,
  };
}