import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';

import { ValidateController } from '../validate.controller';

const validJSONAsyncAPI = {
  asyncapi: '2.0.0',
  info: {
    title: 'My API',
    version: '1.0.0',
  },
  channels: {
    '/test/tester': {
      subscribe: {
        message: {
          payload: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                'x-parser-schema-id': '<anonymous-schema-2>',
              },
            },
            'x-parser-schema-id': '<anonymous-schema-1>',
          },
          'x-parser-original-schema-format':
            'application/vnd.aai.asyncapi;version=2.0.0',
          'x-parser-original-payload': {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
          },
          schemaFormat: 'application/vnd.aai.asyncapi;version=2.0.0',
          'x-parser-message-parsed': true,
          'x-parser-message-name': '<anonymous-message-1>',
        },
      },
    },
  },
  'x-parser-spec-parsed': true,
};

describe('ValidateController', () => {
  describe('[POST] /validate', () => {
    it('should validate AsyncAPI document', async () => {
      const app = new App([new ValidateController()]);

      return await request(app.getServer())
        .post('/validate')
        .send({
          asyncapi: validJSONAsyncAPI,
          template: '@asyncapi/html-template',
          parameters: {
            version: '2.1.37',
          }
        })
        .expect(200);
    });

    it('should throw error when sent asyncapi parameter with wrong type', async () => {
      const app = new App([new ValidateController()]);

      return await request(app.getServer())
        .post('/validate')
        .send({
          asyncapi: 1,
          template: '@asyncapi/html-template',
          parameters: {
            version: '2.1.37'
          }
        })
        .expect(400, {
          type: ProblemException.createType('invalid-request-body'),
          title: 'Bad Request',
          status: 400,
          detail: 'The "asyncapi" field must be a string or object.'
        });
    });

    it('should throw error when sent an undefined asyncapi parameter', async () => {
      const app = new App([new ValidateController()]);

      return await request(app.getServer())
        .post('/validate')
        .send({
          template: '@asyncapi/html-template',
          parameters: {
            customParameter: 'customValue',
          }
        })
        .expect(422, {
          type: ProblemException.createType('invalid-request-body'),
          title: 'Invalid Request Body',
          status: 422,
          validationErrors: [
            {
              instancePath: '',
              schemaPath: '#/required',
              keyword: 'required',
              params: {
                missingProperty: 'asyncapi'
              },
              message: 'must have required property \'asyncapi\''
            }
          ]
        });
    });
  });
});
