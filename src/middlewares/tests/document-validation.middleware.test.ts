import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';
import { documentValidationMiddleware } from '../document-validation.middleware';

import { createTestController } from '../../../tests/test.controller';

// documentValidationMiddleware is added to every route
describe('documentValidationMiddleware', () => {
  describe('[POST] /test', () => {
    it('should pass when `asyncapi` field is not defined', async () => {
      const TestController = createTestController({
        path: '/test',
        method: 'post',
        callback: (_, res) => {
          res.status(200).send({ success: true });
        },
        middlewares: [documentValidationMiddleware],
      });
      const app = new App([new TestController()]);

      return await request(app.getServer())
        .post('/v1/test')
        .send({})
        .expect(200, {
          success: true,
        });
    });

    it('should pass when `asyncapi` field is defined as valid AsyncAPI document', async () => {
      const TestController = createTestController({
        path: '/test',
        method: 'post',
        callback: (_, res) => {
          res.status(200).send({ success: true });
        },
        middlewares: [documentValidationMiddleware],
      });
      const app = new App([new TestController()]);

      return await request(app.getServer())
        .post('/v1/test')
        .send({
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
        path: '/test',
        method: 'post',
        callback: (_, res) => {
          res.status(200).send({ success: true });
        },
        middlewares: [documentValidationMiddleware],
      });
      const app = new App([new TestController()]);

      return await request(app.getServer())
        .post('/v1/test')
        .send({
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
  });
});
