import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';

import { GeneratorController } from "../generator.controller";

// problemMiddleware is added to every route
describe('GeneratorController', () => {
  describe('[POST] /test', () => {
    it('should throw error when sended template parameters are invalid', async () => {
      const app = new App([new GeneratorController()]);

      return await request(app.getServer())
        .post('/generator')
        .send({
          asyncapi: {
            "asyncapi": "2.2.0",
            "info": {
              "title": "Test Service",
              "version": "1.0.0",
            },
            "channels": {},
          },
          template: '@asyncapi/html-template',
          parameters: {
            customParameter: 'customValue',
          }
        })
        .expect(422, {
          type: 'https://api.asyncapi.com/problem/invalid-template-parameters',
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
  });
});
