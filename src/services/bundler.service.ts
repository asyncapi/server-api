import fs from 'fs';
import path from 'path';
import AsyncAPIBundler from '@asyncapi/bundler';

/**
 * Service providing `@asyncapi/bundler` functionality.
 */
export class BundlerService { 
  public async bundle(
    files: Array<string>,
    options: any = {},
  ) {
    const outputPath=options.base;
    await AsyncAPIBundler.bundle(files.map((filepath: string) => fs.readFileSync(path.resolve(filepath), 'utf8')), {base: path.resolve(outputPath)});
  }
}