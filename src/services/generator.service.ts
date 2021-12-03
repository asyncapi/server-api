import AsyncAPIGenerator from '@asyncapi/generator';
import { AsyncAPIDocument } from '@asyncapi/parser';

import { prepareParserConfig } from "../utils/parser";

export class GeneratorService {
  public async generate(
    asyncapi: AsyncAPIDocument,
    template: string,
    parameters: Record<string, any>,
    destDir: string,
    parserOptions: ReturnType<typeof prepareParserConfig>,
  ) {
    const generator = new AsyncAPIGenerator(template, destDir, {
      forceWrite: true,
      templateParams: parameters,
    });
    await generator.generate(asyncapi, parserOptions);
  }
}
