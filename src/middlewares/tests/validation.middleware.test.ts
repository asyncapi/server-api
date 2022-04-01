import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';
import { validationMiddleware } from '../validation.middleware';

import { createTestController } from '../../../tests/test.controller';
import { getAppOpenAPI } from '../../utils/app-openapi';

// test /generate route to check validation of custom requestBody
describe('validationMiddleware', () => {
  it('should pass when request body is valid', async () => {
    const TestController = createTestController({
      path: '/generate',
      method: 'post',
      callback: (_, res) => {
        res.status(200).send({ success: true });
      },
      middlewares: [
        await validationMiddleware({
          path: '/generate',
          method: 'post',
          documents: ['asyncapi'],
        }),
      ],
    });
    const app = new App([new TestController()]);
    await app.init();

    return await request(app.getServer())
      .post('/v1/generate')
      .send({
        asyncapi: {
          asyncapi: '2.2.0',
          info: {
            title: 'Test Service',
            version: '1.0.0',
          },
          channels: {},
        },
        template: '@asyncapi/html-template'
      })
      .expect(200, {
        success: true,
      });
  });

  it('should throw error when request body is invalid', async () => {
    const TestController = createTestController({
      path: '/generate',
      method: 'post',
      callback: (_, res) => {
        res.status(200).send({ success: true });
      },
      middlewares: [
        await validationMiddleware({
          path: '/generate',
          method: 'post',
          documents: ['asyncapi'],
        }),
      ],
    });
    const app = new App([new TestController()]);
    await app.init();
    
    const openApi = await getAppOpenAPI();
    const availableTemplates = openApi.components.schemas.GenerateRequest.properties.template.enum;

    return await request(app.getServer())
      .post('/v1/generate')
      .send({
        asyncapi: {
          asyncapi: '2.2.0',
          info: {
            title: 'Test Service',
            version: '1.0.0',
          },
          channels: {},
        },
        template: 'custom template'
      })
      .expect(422, {
        type: ProblemException.createType('invalid-request-body'),
        title: 'Invalid Request Body',
        status: 422,
        validationErrors: [
          {
            instancePath: '/template',
            schemaPath: '#/properties/template/enum',
            keyword: 'enum',
            params: {
              allowedValues: availableTemplates,
            },
            message: 'must be equal to one of the allowed values'
          }
        ]
      });
  });

  it('should pass when `asyncapi` field is defined as valid AsyncAPI document', async () => {
    const TestController = createTestController({
      path: '/generate',
      method: 'post',
      callback: (_, res) => {
        res.status(200).send({ success: true });
      },
      middlewares: [
        await validationMiddleware({
          path: '/generate',
          method: 'post',
          documents: ['asyncapi'],
        }),
      ],
    });
    const app = new App([new TestController()]);
    await app.init();

    return await request(app.getServer())
      .post('/v1/generate')
      .send({
        template: '@asyncapi/html-template',
        asyncapi: {
          asyncapi: '2.2.0',
          info: {
            title: 'Account Service',
            version: '1.0.0',
            description: 'This service is in charge of processing user signups'
          },
          channels: {
            'user/signedup': {
              subscribe: {
                message: {
                  $ref: '#/components/messages/UserSignedUp'
                }
              }
            }
          },
          components: {
            messages: {
              UserSignedUp: {
                payload: {
                  type: 'object',
                  properties: {
                    displayName: {
                      type: 'string',
                      description: 'Name of the user'
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                      description: 'Email of the user'
                    }
                  }
                }
              }
            }
          }
        }
      })
      .expect(200, {
        success: true,
      });
  });

  it('should throw error when `asyncapi` field is defined as invalid AsyncAPI document', async () => {
    const TestController = createTestController({
      path: '/generate',
      method: 'post',
      callback: (_, res) => {
        res.status(200).send({ success: true });
      },
      middlewares: [
        await validationMiddleware({
          path: '/generate',
          method: 'post',
          documents: ['asyncapi'],
        }),
      ],
    });
    const app = new App([new TestController()]);
    await app.init();

    return await request(app.getServer())
      .post('/v1/generate')
      .send({
        template: '@asyncapi/html-template',
        // without title, version and channels
        asyncapi: {
          asyncapi: '2.2.0',
          info: {
            description: 'This service is in charge of processing user signups'
          }
        }
      })
      .expect(422, {
        type: ProblemException.createType('validation-errors'),
        title: 'There were errors validating the AsyncAPI document.',
        status: 422,
        validationErrors: [
          {
            title: '/info should have required property \'title\'',
            location: { jsonPointer: '/info' }
          },
          {
            title: '/info should have required property \'version\'',
            location: { jsonPointer: '/info' }
          },
          {
            title: '/ should have required property \'channels\'',
            location: { jsonPointer: '/' }
          }
        ],
        parsedJSON: {
          asyncapi: '2.2.0',
          info: {
            description: 'This service is in charge of processing user signups',
          },
        }
      });
  });

  it('should pass when `asyncapi` field is defined as valid AsyncAPI document with references', async () => {
    const TestController = createTestController({
      path: '/generate',
      method: 'post',
      callback: (_, res) => {
        res.status(200).send({ success: true });
      },
      middlewares: [
        await validationMiddleware({
          path: '/generate',
          method: 'post',
          documents: ['asyncapi'],
        }),
      ],
    });
    const app = new App([new TestController()]);
    await app.init();

    return await request(app.getServer())
      .post('/v1/generate')
      .send({
        template: '@asyncapi/html-template',
        asyncapi: {
          document: {
            asyncapi: '2.0.0',
            info: {
              title: 'Super test',
              version: '1.0.0'
            },
            channels: {
              someChannel1: {
                $ref: '../some-file.json#/components/someChannel',
              },
              someChannel2: {
                $ref: '../../another-file.json#/components/someChannel',
              }
            }
          },
          references: {
            '../some-file.json': {
              components: {
                someChannel: {
                  $ref: '../another-file.json#/components/someChannel',
                }
              }
            },
            '../../another-file.json': {
              components: {
                someChannel: {
                  subscribe: {},
                }
              }
            }
          }
        }
      })
      .expect(200, {
        success: true,
      });
  });

  it('should pass when `asyncapis` field is defined as valid AsyncAPI documents with references', async () => {
    const TestController = createTestController({
      path: '/diff',
      method: 'post',
      callback: (_, res) => {
        res.status(200).send({ success: true });
      },
      middlewares: [
        await validationMiddleware({
          path: '/diff',
          method: 'post',
          documents: ['asyncapis'],
        }),
      ],
    });
    const app = new App([new TestController()]);
    await app.init();

    return await request(app.getServer())
      .post('/v1/diff')
      .send({
        asyncapis: [
          {
            document: {
              asyncapi: '2.0.0',
              info: {
                title: 'Super test',
                version: '1.0.0'
              },
              channels: {
                someChannel1: {
                  $ref: '../some-file.json#/components/someChannel',
                },
                someChannel2: {
                  $ref: '../../another-file.json#/components/someChannel',
                }
              }
            },
            references: {
              '../some-file.json': {
                components: {
                  someChannel: {
                    $ref: '../another-file.json#/components/someChannel',
                  }
                }
              },
              '../../another-file.json': {
                components: {
                  someChannel: {
                    subscribe: {},
                  }
                }
              }
            }
          },
          {
            document: {
              asyncapi: '2.0.0',
              info: {
                title: 'Super test',
                version: '1.0.0'
              },
              channels: {
                someChannel1: {
                  $ref: '../some-file.json#/components/someChannel',
                },
                someChannel2: {
                  $ref: '../../another-file.json#/components/someChannel',
                }
              }
            },
            references: {
              '../some-file.json': {
                components: {
                  someChannel: {
                    $ref: '../another-file.json#/components/someChannel',
                  }
                }
              },
              '../../another-file.json': {
                components: {
                  someChannel: {
                    subscribe: {},
                  }
                }
              }
            }
          }
        ],
      })
      .expect(200, {
        success: true,
      });
  });
});
