import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';

import { GeneratorController } from "../generator.controller";

describe('GeneratorController', () => {
  describe('[POST] /generator', () => {
    it('should generate template ', async () => {
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
            version: '2.1.37',
          }
        })
        .expect(200);
    });

    it('should pass when sent template parameters are empty', async () => {
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
        })
        .expect(200);
    });

    it('should throw error when sent template parameters are invalid', async () => {
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
  });
});
