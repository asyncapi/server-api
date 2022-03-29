import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';

import { BundleController } from '../bundle.controller';

describe('BundleController', () => {
  describe('[POST] /bundle', () => {
    it('should bundle files', async () => {
      const app = new App([new BundleController()]);
      await app.init();

      await request(app.getServer())
        .post('/v1/bundle')
        .send({
          asyncapis: [{
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
          }],
          base: {
            asyncapi: '2.2.0',
            info: {
              title: 'Merged test service',
              version: '1.2.0',
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
          }
        })
        .expect(200, {
          bundled: {
            asyncapi: '2.2.0',
            info: { title: 'Merged test service', version: '1.2.0' },
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

    it('should throw error with invalid AsyncAPI document in the `base` list', async () => {
      const app = new App([new BundleController()]);
      await app.init();

      await request(app.getServer())
        .post('/v1/bundle')
        .send({
          asyncapis: [{
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
          }],
          base: {
            asyncapi: '2.2.0',
            info: {
              tite: 'My API', // spelled wrong on purpose to throw an error in the test
              version: '1.0.0'
            },
            channels: {}
          }
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

    it('should throw error with invalid AsyncAPI document in the `asyncapis` list', async () => {
      const app = new App([new BundleController()]);
      await app.init();

      await request(app.getServer())
        .post('/v1/bundle')
        .send({
          asyncapis: [{
            asyncapi: '2.2.0',
            info: {
              tite: 'My API', // spelled wrong on purpose to throw an error in the test
              version: '1.0.0'
            },
            channels: {}
          }],
          base: {
            asyncapi: '2.2.0',
            info: {
              title: 'Merged test service',
              version: '1.2.0',
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
          }
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