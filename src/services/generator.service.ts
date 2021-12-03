import AsyncAPIGenerator from '@asyncapi/generator';
import { AsyncAPIDocument } from '@asyncapi/parser';

import { prepareParserConfig } from "../utils/parser";

/**
 * Service providing `@asyncapi/generator` functionality.
 */
export class GeneratorService {
  public async generate(
    asyncapi: AsyncAPIDocument | string,
    template: string,
    parameters: Record<string, any>,
    destDir: string,
    parserOptions: ReturnType<typeof prepareParserConfig>,
  ) {
    const generator = new AsyncAPIGenerator(template, destDir, {
      forceWrite: true,
      templateParams: parameters,
    });

    if (typeof asyncapi === 'string') {
      await generator.generateFromString(asyncapi, parserOptions);
    } else {
      await generator.generate(asyncapi, parserOptions);
    }
  }
}
