import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';

import { ParseController } from '../parse.controller';

const validJSONAsyncAPI = {
  asyncapi: '2.0.0',
  info: {
    title: 'My API',
    version: '1.0.0'
  },
  channels: {}
};
const invalidJSONAsyncAPI = {
  asyncapi: '2.0.0',
  info: {
    tite: 'My API', // spelled wrong on purpose to throw an error in the test
    version: '1.0.0'
  },
  channels: {}
};

describe('ParseController', () => {
  describe('[POST] /parse', () => {
    it('should return stringified AsyncAPI document', async () => {
      const app = new App([new ParseController()]);
      await app.init();

      return request(app.getServer())
        .post('/v1/parse')
        .send({
          asyncapi: validJSONAsyncAPI
        })
        .expect(200, {
          parsed: '{"asyncapi":"2.0.0","info":{"title":"My API","version":"1.0.0"},"channels":{},"x-parser-spec-parsed":true,"x-parser-spec-stringified":true}',
        });
    });

    it('should throw error when sent an invalid AsyncAPI document', async () => {
      const app = new App([new ParseController()]);
      await app.init();

      return request(app.getServer())
        .post('/v1/parse')
        .send({
          asyncapi: invalidJSONAsyncAPI
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
