// include production config in the `dist` folder
import './configs/production.json';

// for `config` module
process.env['NODE_CONFIG_DIR'] = `${__dirname  }/configs`;

import { App } from './app';
import { GenerateController } from './controllers/generate.controller';
import { ValidateController } from './controllers/validate.controller';
import { ConvertController } from './controllers/convert.controller';
import { BundlerController } from './controllers/bundler.controller';
import { DocsController } from './controllers/docs.controller';

async function main() {
  const app = new App([
    new GenerateController(),
    new ValidateController(),
    new ConvertController(),
    new BundlerController(),
    new DocsController()
  ]);
  await app.init();
  app.listen();
}
main();
