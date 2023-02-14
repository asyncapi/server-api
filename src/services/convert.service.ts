import { convert } from '@asyncapi/converter';

import YAML from 'js-yaml';

import { AsyncAPIDocument, LAST_SPEC_VERSION, SpecsEnum } from '../interfaces';
import { ProblemException } from '../exceptions/problem.exception';

import type { ConvertVersion } from '@asyncapi/converter';

/**
 * Service providing `@asyncapi/converter` functionality.
 */
export class ConvertService {
  /**
   * Convert the given spec to the desired version and format.
   * @param spec AsyncAPI spec
   * @param language Language to convert to, YAML or JSON
   * @param version AsyncAPI spec version
   * @returns converted spec
   */
  public async convert(
    spec: string | AsyncAPIDocument,
    version: SpecsEnum = LAST_SPEC_VERSION as SpecsEnum,
    language?: 'json' | 'yaml' | 'yml'
  ): Promise<string> {
    if (version === 'latest') {
      version = LAST_SPEC_VERSION as SpecsEnum;
    }

    try {
      const asyncapiSpec =
        typeof spec === 'object' ? JSON.stringify(spec) : spec;
      const convertedSpec = convert(asyncapiSpec, version as ConvertVersion);

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
        detail: (err as Error).message,
      });
    }
  }

  private convertToFormat(
    spec: string | Record<string, unknown>,
    language: 'json' | 'yaml' | 'yml'
  ) {
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
        detail: (err as Error).message,
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
