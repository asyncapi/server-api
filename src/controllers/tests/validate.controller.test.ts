import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';

import { ValidateController } from '../validate.controller';

const validJSONAsyncAPI = {
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

      return request(app.getServer())
        .post('/validate')
        .send(validJSONAsyncAPI)
        .expect(200);
    });

    it('should validate AsyncAPI document in YAML', async () => {
      const app = new App([new ValidateController()]);

      return request(app.getServer())
        .post('/validate')
        .set('Content-Type', 'application/x-yaml')
        .send(validYAMLAsyncAPI)
        .expect(200);
    });

    it('should throw error when sent an empty document', async () => {
      const app = new App([new ValidateController()]);

      return request(app.getServer())
        .post('/validate')
        .send({})
        .expect(422, {
          type: ProblemException.createType('missing-asyncapi-field'),
          title: 'The `asyncapi` field is missing.',
          status: 422,
          parsedJSON: {}
        });
    });

    it('should throw error when sent an invalid AsyncAPI document', async () => {
      const app = new App([new ValidateController()]);

      return request(app.getServer())
        .post('/validate')
        .send(invalidJSONAsyncAPI)
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
