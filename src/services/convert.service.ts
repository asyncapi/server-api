import { convert } from '@asyncapi/converter';
import { AsyncAPIDocument } from '@asyncapi/parser';
import specs from '@asyncapi/specs';

import * as JSYAML from 'js-yaml';
import YAML from 'yaml';

import { logger } from '../utils/logger';

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
    version: string = this.getLastVersion(),
  ): Promise<string> {
    try {
      let asyncapiSpec: string;
      if (typeof spec === 'object') { // TODO: can we check if it's an instance of AsyncAPIDocument?
        // Convert JSON object to YAML
        const doc = new YAML.Document();
        doc.contents = spec;
        asyncapiSpec = doc.toString();
      } else {
        asyncapiSpec = spec;
      }

      const convertedSpec = convert(asyncapiSpec, version);

      return language === 'json'
        ? this.convertToJSON(convertedSpec)
        : convertedSpec;
    } catch (err) {
      logger.error('[ConvertService] An error has occurred while converting spec to version: {0}. Error: {1}', version, err);
      throw err;
    }
  }

  private getLastVersion = () => Object.keys(specs).pop();

  private convertToJSON(spec: string) {
    try {
      // JSON or YAML String -> JS object
      const jsonContent = JSYAML.load(spec);
      // JS Object -> pretty JSON string
      return JSON.stringify(jsonContent, null, 2);
    } catch (err) {
      logger.error('[ConvertService.convertToJSON] Error: {0}', err);
      throw err;
    }
  }
}
