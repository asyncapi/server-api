import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';

import { GenerateController } from '../generate.controller';

describe('GeneratorController', () => {
  describe('[POST] /generate', () => {
    it('should generate template ', async () => {
      const app = new App([new GenerateController()]);

      return request(app.getServer())
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
          template: '@asyncapi/html-template',
          parameters: {
            version: '2.1.37',
          }
        })
        .expect(200);
    });

    it('should pass when sent template parameters are empty', async () => {
      const app = new App([new GenerateController()]);

      return request(app.getServer())
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
          template: '@asyncapi/html-template',
        })
        .expect(200);
    });

    it('should throw error when sent template parameters are invalid', async () => {
      const app = new App([new GenerateController()]);

      return request(app.getServer())
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
          template: '@asyncapi/html-template',
          parameters: {
            customParameter: 'customValue',
          }
        })
        .expect(422, {
          type: ProblemException.createType('invalid-template-parameters'),
          title: 'Invalid Generator Template parameters',
          status: 422,
          validationErrors: [
            {
              instancePath: '',
              schemaPath: '#/additionalProperties',
              keyword: 'additionalProperties',
              params: {
                additionalProperty: 'customParameter'
              },
              message: 'must NOT have additional properties'
            }
          ]
        });
    });

    it('should throw error when required parameter is not sent', async () => {
      const app = new App([new GenerateController()]);

      return request(app.getServer())
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
          template: '@asyncapi/nodejs-template',
          parameters: {
            invalidServer: 'invalidServer',
          }
        })
        .expect(422, {
          type: ProblemException.createType('invalid-template-parameters'),
          title: 'Invalid Generator Template parameters',
          status: 422,
          validationErrors: [
            {
              instancePath: '',
              schemaPath: '#/required',
              keyword: 'required',
              params: { missingProperty: 'server' },
              message: 'must have required property \'server\''
            },
            {
              instancePath: '',
              schemaPath: '#/additionalProperties',
              keyword: 'additionalProperties',
              params: { additionalProperty: 'invalidServer' },
              message: 'must NOT have additional properties'
            }
          ]
        });
    });
  });
});
