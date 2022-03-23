import request from 'supertest';

import { App } from '../../app';

import { BundlerController } from '../bundler.controller';

describe('BundlerController', () => {
  describe('[POST] /bundle', () => {
    it('should bundle files', async () => {
      const app = new App([new BundlerController()]);
      const response = await request(app.getServer())
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
        .set('Accept', 'application/json');
      expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
      expect(response.status).toBe(200);
    });
  });
});