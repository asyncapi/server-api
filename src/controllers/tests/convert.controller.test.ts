import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';
import { ALL_SPECS } from '../../interfaces';

import { ConvertController } from '../convert.controller';

const validJsonAsyncAPI2_0_0 = {
  asyncapi: '2.0.0',
  info: {
    title: 'Super test',
    version: '1.0.0'
  },
  channels: {}
};

const validJsonAsyncAPI2_1_0 = {
  asyncapi: '2.1.0',
  info: {
    title: 'Super test',
    version: '1.0.0'
  },
  channels: {}
};

const validYamlAsyncAPI2_4_0 = `
asyncapi: 2.4.0
info:
  title: Super test
  version: 1.0.0
channels: {}
`;

describe('ConvertController', () => {
  describe('[POST] /convert', () => {
    it('should throw error with invalid version', async () => {
      const app = new App([new ConvertController()]);
      await app.init();

      return request(app.getServer())
        .post('/v1/convert')
        .send({
          asyncapi: {
            asyncapi: '2.2.0',
            info: {
              title: 'Test Service',
              version: '1.0.0',
            },
            channels: {},
          },
          version: '1'
        })
        .expect(422, {
          type: ProblemException.createType('invalid-request-body'),
          title: 'Invalid Request Body',
          status: 422,
          validationErrors: [
            {
              instancePath: '/version',
              schemaPath: '#/properties/version/enum',
              keyword: 'enum',
              params: {
                allowedValues: [...ALL_SPECS, 'latest'],
              },
              message: 'must be equal to one of the allowed values'
            }
          ]
        });
    });

    it('should throw error that the converter cannot convert to a lower version', async () => {
      const app = new App([new ConvertController()]);
      await app.init();

      return request(app.getServer())
        .post('/v1/convert')
        .send({
          asyncapi: validJsonAsyncAPI2_1_0,
          version: '2.0.0'
        })
        .expect(422, {
          type: 'https://api.asyncapi.com/problem/internal-converter-error',
          title: 'Could not convert document',
          status: 422,
          detail: 'Cannot downgrade from 2.1.0 to 2.0.0.',
        });
    });

    it('should pass when converting to 2.4.0 version', async () => {
      const app = new App([new ConvertController()]);
      await app.init();

      return request(app.getServer())
        .post('/v1/convert')
        .send({
          asyncapi: validJsonAsyncAPI2_0_0,
          version: '2.4.0'
        })
        .expect(200, {
          converted: {
            asyncapi: '2.4.0',
            info: {
              title: 'Super test',
              version: '1.0.0'
            },
            channels: {},
          },
        });
    });

    it('should pass when converting to latest version', async () => {
      const app = new App([new ConvertController()]);
      await app.init();

      return request(app.getServer())
        .post('/v1/convert')
        .send({
          asyncapi: validJsonAsyncAPI2_0_0,
        })
        .expect(200, {
          converted: {
            asyncapi: '2.6.0',
            info: {
              title: 'Super test',
              version: '1.0.0'
            },
            channels: {},
          },
        });
    });

    it('should correctly convert JSON to YAML', async () => {
      const app = new App([new ConvertController()]);
      await app.init();

      return request(app.getServer())
        .post('/v1/convert')
        .send({
          asyncapi: validJsonAsyncAPI2_0_0,
          version: '2.4.0',
          language: 'yaml'
        })
        .expect(200, {
          converted: validYamlAsyncAPI2_4_0.trimStart(),
        });
    });
  });
});
