import path from 'path';

// for `config` module
process.env['NODE_CONFIG_DIR'] = path.join(__dirname, '../src/configs');
