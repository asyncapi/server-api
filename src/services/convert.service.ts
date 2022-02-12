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
    language = '',
    version: string = LAST_SPEC_VERSION,
  ): Promise<string> {
    try {
      const asyncapiSpec = typeof spec === 'object' ? JSON.stringify(spec) : spec;
      const convertedSpec = convert(asyncapiSpec, version);

      return language === 'json'
        ? this.convertToJSON(convertedSpec)
        : convertedSpec;
    } catch (err) {
      if (err instanceof ProblemException) {
        throw err;
      }

      throw new ProblemException({
        type: '/problems/converter',
        title: 'Could not convert document',
        status: 422,
        detail: (err as Error).message
      });
    }
  }

  private convertToJSON(spec: string) {
    try {
      // JSON or YAML String -> JS object
      const jsonContent = YAML.load(spec);
      // JS Object -> pretty JSON string
      return JSON.stringify(jsonContent, null, 2);
    } catch (err) {
      throw new ProblemException({
        type: '/problems/converter-json',
        title: 'Could not convert document',
        status: 422,
        detail: (err as Error).message
      });
    }
  }
}
