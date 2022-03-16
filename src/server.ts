// include production config in the `dist` folder
import './configs/production.json';

// for `config` module
process.env['NODE_CONFIG_DIR'] = `${__dirname  }/configs`;

import { App } from './app';
import { GenerateController } from './controllers/generate.controller';
import { ValidateController } from './controllers/validate.controller';
import { DocsController } from './controllers/docs.controller';

const app = new App([
  new GenerateController(),
  new ValidateController(),
  new DocsController()
]);
app.listen();
