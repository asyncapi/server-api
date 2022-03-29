import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';

import { DiffController } from '../../controllers/diff.controller';

describe('DiffController', () => {
  describe('[POST] /diff', () => {
    it('should diff AsyncAPI documents', async () => {
      const app = new App([new DiffController()]);
      await app.init();

      await request(app.getServer())
        .post('/v1/diff')
        .send({
          asyncapis: [
            {
              asyncapi: '2.3.0',
              info: {
                title: 'Super test',
                version: '1.0.0'
              },
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
            },
            {
              asyncapi: '2.3.0',
              info: {
                title: 'Changed super test',
                version: '1.1.0'
              },
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
            }, 
          ],
        })
        .expect(200, {
          diff: {
            changes: [
              {
                action: 'edit',
                path: '/info/version',
                before: '1.0.0',
                after: '1.1.0',
                type: 'breaking',
              },
              {
                action: 'edit',
                path: '/info/title',
                before: 'Super test',
                after: 'Changed super test',
                type: 'non-breaking',
              },
            ],
          }
        });
    });

    it('should throw error with invalid AsyncAPI document', async () => {
      const app = new App([new DiffController()]);
      await app.init();

      await request(app.getServer())
        .post('/v1/diff')
        .send({
          asyncapis: [
            {
              asyncapi: '2.2.0',
              info: {
                title: 'Test Service',
                version: '1.0.0',
              },
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
            },
            {
              asyncapi: '2.2.0',
              info: {
                tite: 'My API', // spelled wrong on purpose to throw an error in the test
                version: '1.0.0'
              },
              channels: {},
            }
          ],
        })
        .expect(422, {
          type: ProblemException.createType('validation-errors'),
          title: 'There were errors validating the AsyncAPI document.',
          status: 422,
          validationErrors: [
            {
              title: '/info should NOT have additional properties',
              location: {
                jsonPointer: '/info'
              }
            },
            {
              title: '/info should have required property \'title\'',
              location: {
                jsonPointer: '/info'
              }
            }
          ],
          parsedJSON: {
            asyncapi: '2.2.0',
            info: {
              tite: 'My API',
              version: '1.0.0'
            },
            channels: {}
          }
        });
    });
  });    
});
