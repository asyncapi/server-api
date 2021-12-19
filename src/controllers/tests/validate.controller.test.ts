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
const validYAMLAsyncAPI = `
asyncapi: '2.2.0'
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signups
channels:
  user/signedup:
    subscribe:
      message:
        $ref: '#/components/messages/UserSignedUp'
components:
  messages:
    UserSignedUp:
      payload:
        type: object
        properties:
          displayName:
            type: string
            description: Name of the user
          email:
            type: string
            format: email
            description: Email of the user
`;
const invalidJSONAsyncAPI = {
  asyncapi: '2.0.0',
  info: {
    tite: 'My API', // spelled wrong on purpose to throw an error in the test
    version: '1.0.0'
  },
  channels: {}
};

describe('ValidateController', () => {
  describe('[POST] /validate', () => {
    it('should validate AsyncAPI document in JSON', async () => {
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

    it('should validate AsyncAPI document in YAML', async () => {
      const app = new App([new ValidateController()]);

      return await request(app.getServer())
        .post('/validate')
        .set('Content-Type', 'application/x-yaml')
        .send(validYAMLAsyncAPI)
        .expect(200);
    });

    it('should throw error when sent an unsupported content type header', async () => {
      const app = new App([new ValidateController()]);

      return await request(app.getServer())
        .post('/validate')
        .set('Content-Type', 'text/plain')
        .send(validYAMLAsyncAPI)
        .expect(400, {
          type: ProblemException.createType('invalid-document-type'),
          title: 'Bad Request',
          status: 400,
          detail: 'The supported content types are: application/json, application/x-yaml'
        });
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
          type: ProblemException.createType('invalid-document-type'),
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

    it('should throw error when sent an invalid AsyncAPI document', async () => {
      const app = new App([new ValidateController()]);

      return await request(app.getServer())
        .post('/validate')
        .send({
          asyncapi: invalidJSONAsyncAPI,
          template: '@asyncapi/html-template',
          parameters: {
            customParameter: 'customValue',
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
            asyncapi: '2.0.0',
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
