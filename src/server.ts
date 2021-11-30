// for `config` module
process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

// import 'dotenv/config';
import { App } from './app';
import { GeneratorRoute } from './routes/generator.route';

const app = new App([
  new GeneratorRoute()
]);
app.listen();
