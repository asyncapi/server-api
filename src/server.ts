// for `config` module
process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import { App } from './app';
import { GenerateController } from './controllers/generate.controller';

const app = new App([
  new GenerateController()
]);
app.listen();
