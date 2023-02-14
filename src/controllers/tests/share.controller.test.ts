import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';

import { ShareController } from '../share.controller';

const validAsyncAPIDocument = {
  asyncapi: '2.5.0',
  info: {
    title: 'Account Service',
    version: '1.0.0',
    description: 'This service is in charge of processing user signups',
  },
  channels: {
    'user/signedup': {
      subscribe: {
        message: {
          $ref: '#/components/messages/UserSignedUp',
        },
      },
    },
  },
  components: {
    messages: {
      UserSignedUp: {
        payload: {
          type: 'object',
          properties: {
            displayName: {
              type: 'string',
              description: 'Name of the user',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email of the user',
            },
          },
        },
      },
    },
  },
}; 

describe('ShareController', () => {
  let app: App;

  beforeAll(async () => {
    app = new App([new ShareController()]);
    await app.init();
  });

  afterAll(async () => {
    await app.dispose();
  });

  describe('[POST-GET] /share', () => {
    let id = '';

    it('should return the document ID and then reuse it for retrieving document', async () => {
      await request(app.getServer())
        .post('/v1/share')
        .send({
          asyncapi: validAsyncAPIDocument,
          expireAt: '2022-08-10T23:00:00.000Z',
        })
        .expect(201)
        .then((response) => {
          id = response.body.id;
        });

      return await request(app.getServer())
        .get(`/v1/share/${id}`)
        .send()
        .expect(200);
    });

    it('should throw error when document ID is not a valid ID ', async () => {
      id = '806c262f-7bd7-41c0-88c9-0595c96b5c53c';
      return await request(app.getServer())
        .get(`/v1/share/${id}`)
        .send()
        .expect(422, {
          type: 'https://api.asyncapi.com/problem/invalid-request-parameters',
          title: 'Invalid Request Parameters',
          status: 422,
          validationErrors: [
            {
              instancePath: '/id',
              schemaPath: '#/properties/id/format',
              keyword: 'format',
              params: { format: 'uuid' },
              message: 'must match format "uuid"',
            },
          ],
        });
    });

    it('should throw error when document ID doesn\'t exist in the record ', async () => {
      id = '806c262f-7bd7-41c0-88c9-0595c96b5c5c';
      return await request(app.getServer())
        .get(`/v1/share/${id}`)
        .send()
        .expect(404, {
          type: 'https://api.asyncapi.com/problem/not-available-id',
          title: `No document with id "${id}" was found.`,
          status: 404,
        });
    });
  });
});
