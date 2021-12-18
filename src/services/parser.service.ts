import { parse, prepareParserConfig } from '../utils/parser';

/**
 * Service providing `@asyncapi/parser` functionality.
 */
export class ParserService {
  public async parse(asyncapi: string | any, options?: ReturnType<typeof prepareParserConfig>) {
    if (!asyncapi) {
      return null;
    }

    return await parse(asyncapi, options);
  }
}
