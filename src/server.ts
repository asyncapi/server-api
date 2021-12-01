// for `config` module
process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import { App } from './app';
import { GeneratorController } from './controllers/generator.controller';

const app = new App([
  new GeneratorController()
]);
app.listen();
