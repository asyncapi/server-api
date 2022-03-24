import request from 'supertest';

import { App } from '../../app';

import { BundlerController } from '../bundler.controller';

describe('BundlerController', () => {
  describe('[POST] /bundle', () => {
    it('should bundle files', async () => {
      const app = new App([new BundlerController()]);
      await request(app.getServer())
        .post('/v1/bundle')
        .send({
          asyncapis: [{
            asyncapi: '2.2.0',
            info: {
              title: 'Test Service',
              version: '1.0.0',
            },
            servers: {},
            channels: {
              'test-channel-2': {
                publish: {
                  message: {
                    payload: {
                      type: 'object',
                    },
                  },
                }
              },
            },
          }],
          base: {
            asyncapi: '2.2.0',
            info: {
              title: 'Merged test service',
              version: '1.2.0',
            },
            servers: {},
            channels: {
              'test-channel-1': {
                publish: {
                  message: {
                    payload: {
                      type: 'object',
                    },
                  },
                }
              },
            },
          }
        }).
        expect(200, {
          bundled: {
            asyncapi: '2.2.0',
            info: { title: 'Merged test service', version: '1.2.0' },
            servers: {},
            channels: {
              'test-channel-1': {
                publish: {
                  message: {
                    payload: {
                      type: 'object',
                    },
                  },
                }
              },
              'test-channel-2': {
                publish: {
                  message: {
                    payload: {
                      type: 'object',
                    },
                  },
                }
              },
            }
          }
        });
    });
  });
});