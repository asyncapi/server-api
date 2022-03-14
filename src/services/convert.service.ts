import { convert } from '@asyncapi/converter';
import { AsyncAPIDocument } from '@asyncapi/parser';

import YAML from 'js-yaml';
import { ProblemException } from '../exceptions/problem.exception';
import { LAST_SPEC_VERSION } from '../interfaces';

/**
 * Service providing `@asyncapi/converter` functionality.
 */
export class ConvertService {
  /**
   * Convert the given spec to the desired language.
   * @param spec AsyncAPI spec
   * @param language Language to convert to, YAML or JSON
   * @param version [version] AsyncAPI spec version
   * @returns converted spec
   */
  public async convertSpec(
    spec: AsyncAPIDocument | string,
    language: 'json' | 'yaml' | 'yml',
    version: string = LAST_SPEC_VERSION,
  ): Promise<string> {
    try {
      const asyncapiSpec = typeof spec === 'object' ? JSON.stringify(spec) : spec;
      const convertedSpec = convert(asyncapiSpec, version);

      if (!language) {
        return convertedSpec;
      }
      return this.convertToFormat(convertedSpec, language);
    } catch (err) {
      if (err instanceof ProblemException) {
        throw err;
      }

      throw new ProblemException({
        type: 'internal-converter-error',
        title: 'Could not convert document',
        status: 422,
        detail: (err as Error).message
      });
    }
  }

  private convertToFormat(spec: string | Record<string, unknown>, language: 'json' | 'yaml' | 'yml') {
    if (typeof spec === 'object') {
      spec = JSON.stringify(spec, undefined, 2);
    }

    try {
      if (language === 'json') {
        return this.convertToJSON(spec);
      }
      return this.convertToYaml(spec);
    } catch (err) {
      throw new ProblemException({
        type: 'converter-output-format',
        title: `Could not transform output to ${language}`,
        status: 422,
        detail: (err as Error).message
      });
    }
  }

  private convertToJSON(spec: string) {
    // JSON or YAML String -> JS object
    const jsonContent = YAML.load(spec);
    // JS Object -> pretty JSON string
    return JSON.stringify(jsonContent, undefined, 2);
  }

  private convertToYaml(spec: string) {
    // Editor content -> JS object -> YAML string
    const jsonContent = YAML.load(spec);
    return YAML.dump(jsonContent);
  }
}
