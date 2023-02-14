import path from 'path';

// for `config` module
process.env['NODE_CONFIG_DIR'] = path.join(__dirname, '../src/configs');

// for `mongo` db
process.env['MONGODB_URI'] = 'mongodb://localhost:27017/asyncapi-documents';