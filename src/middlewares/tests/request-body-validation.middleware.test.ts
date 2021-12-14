import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';

import { createTestController } from '../../../tests/test.controller';

// requestBodyValidationMiddleware is added to every route
// test /generate route to check validation of custom requestBody
describe('requestBodyValidationMiddleware', () => {
  describe('[POST] /generate', () => {
    it('should pass when request body is valid', async () => {
      const TestController = createTestController({
        path: '/generate',
        method: 'post',
        callback: (_, res) => {
          res.status(200).send({ success: true });
        },
      });
      const app = new App([new TestController()]);

      return await request(app.getServer())
        .post('/generate')
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
        path: '/test',
        method: 'post',
        callback: (_, res) => {
          res.status(200).send({ success: true });
        },
      });
      const app = new App([new TestController()]);

      return await request(app.getServer())
        .post('/generate')
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
                allowedValues: ['@asyncapi/html-template', '@asyncapi/markdown-template']
              },
              message: 'must be equal to one of the allowed values'
            }
          ]
        });
    });
  });
});
