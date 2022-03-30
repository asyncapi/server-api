// include production config in the `dist` folder
import './configs/production.json';

// for `config` module
process.env['NODE_CONFIG_DIR'] = `${__dirname  }/configs`;

import { App } from './app';
import { GenerateController } from './controllers/generate.controller';
import { ValidateController } from './controllers/validate.controller';
import { ConvertController } from './controllers/convert.controller';
import { BundleController } from './controllers/bundle.controller';
import { DiffController } from './controllers/diff.controller';
import { OptimizeController } from './controllers/optimize.controller';
import { DocsController } from './controllers/docs.controller';

async function main() {
  const app = new App([
    new GenerateController(),
    new ValidateController(),
    new ConvertController(),
    new BundleController(),
    new DiffController(),
    new OptimizeController(),
    new DocsController()
  ]);
  await app.init();
  app.listen();
}
main();
