import { promises as fs } from 'fs';
import path from 'path';

import YAML from 'js-yaml';
import $RefParser from '@apidevtools/json-schema-ref-parser';

let parsedOpenAPI = undefined;

/**
 * Retrieve application's OpenAPI document.
 */
export async function getAppOpenAPI(): Promise<any> {
  if (parsedOpenAPI) {
    return parsedOpenAPI;
  }
  
  const openaAPI = await fs.readFile(path.join(__dirname, '../../openapi.yaml'), 'utf-8');
  parsedOpenAPI = YAML.load(openaAPI);
  const refParser = new $RefParser;
  await refParser.dereference(parsedOpenAPI);

  return parsedOpenAPI;
}
