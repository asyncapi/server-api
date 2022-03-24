import request from 'supertest';
import { App } from '../../app';

import { DiffController } from '../../controllers/diff.controller';

describe('DiffController', () => {
  describe('[POST] /diff', () => {
    it('should diff files', async () => {
      const app = new App([new DiffController()]);
      const asyncapi1 = {
        version: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/test': {
            get: {
              responses: {
                200: {
                  body: {
                    type: 'object',
                    properties: {
                      test: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };
      const asyncapi2 = {
        version: '2.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/test': {
            get: {
              responses: {
                200: {
                  body: {
                    type: 'object',
                    properties: {
                      test: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      await request(app.getServer())
        .post('/v1/diff')
        .send({
          asyncapis: [asyncapi1, asyncapi2],
        })
        .expect(200, {
          diff: {
            added: [
              {
                path: '/test',
                method: 'get',
                response: {
                  status: 200,
                  body: {
                    type: 'object',
                    properties: {
                      test: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            ],
            removed: [],
          },
        });
    });
  });    
});