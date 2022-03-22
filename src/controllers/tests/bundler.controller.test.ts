import request from 'supertest';

import { App } from '../../app';

import { BundlerController } from '../bundler.controller';

describe('BundlerController', () => {
  describe('[POST] /bundle', () => {
    it('should bundle files', async () => {
      const app = new App([new BundlerController()]);
      return request(app.getServer())
        .post('/v1/bundle')
        .send({
          asyncapis: [{
            asyncapi: '2.2.0',
            info: {
              title: 'Test Service',
              version: '1.0.0',
            },
            channels: {
              'test-channel': {
                messages: {
                  'test-message': {
                    payload: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          }],
          base: {
            asyncapi: '2.2.0',
            info: {
              title: 'Test Service',
              version: '1.0.0',
            },
            channels: {},
          }
        })
        .expect('Content-Type', /json/)
        .expect((res) => {
          console.log(res.body);
          expect(res.body).toHaveProperty('asyncapi');
          expect(res.body).toHaveProperty('info');
        })
        .expect(200);
    });
  });
});