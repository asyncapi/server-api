// @ts-ignore
import AsyncAPIGenerator from '@asyncapi/generator';
import { AsyncAPIDocument } from '@asyncapi/parser';

import { prepareParserConfig } from '../utils/parser';

/**
 * Service providing `@asyncapi/generate` functionality.
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
    } else if (asyncapi instanceof AsyncAPIDocument) {
      await generator.generate(asyncapi);
    } else { // object case
      await generator.generateFromString(JSON.stringify(asyncapi), parserOptions);
    }
  }
}
