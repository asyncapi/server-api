// include production config in the `dist` folder
import './configs/production.json';

// for `config` module
process.env['NODE_CONFIG_DIR'] = `${__dirname}/configs`;

import { App } from './app';
import { ValidateController } from './controllers/validate.controller';
import { ParseController } from './controllers/parse.controller';
import { GenerateController } from './controllers/generate.controller';
import { ConvertController } from './controllers/convert.controller';
import { BundleController } from './controllers/bundle.controller';
import { DiffController } from './controllers/diff.controller';
import { DocsController } from './controllers/docs.controller';
import { HelpController } from './controllers/help.controller';

async function main() {
  const app = new App([
    new ValidateController(),
    new ParseController(),
    new GenerateController(),
    new ConvertController(),
    new BundleController(),
    new DiffController(),
    new DocsController(),
    new HelpController(),
  ]);
  await app.init();
  app.listen();
}
main();
