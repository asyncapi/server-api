import request from 'supertest';
import mongoose from 'mongoose';

import { App } from '../../app';

import {ShareController} from '../share.controller';

const validAsyncFile = {
  asyncapi: {
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
  },
};

const invalidAsyncApiFile = {
  asyncapi: {
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
  },
};

const invalidUUID = '63ybdy474'; 

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/asyncapi'
  );
});

describe('ShareController', () => {
  describe('[POST] /share', () => {
    it('should return the spec ID', async () => {
      const app = new App([new ShareController()]);
      await app.init();

      return request(app.getServer())
        .post('/v1/share')
        .send(validAsyncFile)
        .expect(201);
    });

    it('should return an error when an invalid spec is passed', async () => {
      const app = new App([new ShareController()]);
      await app.init();

      return request(app.getServer())
        .post('/v1/share')
        .send(invalidAsyncApiFile)
        .expect(422);
    });
  });

  describe('[GET] /share/id', () => {
    it('it should return an invalid UUID ID', async () => {
      const app = new App([new ShareController]);
      await app.init();

      return request(app.getServer())
        .get(`/share/${invalidUUID}`)
        .expect(404);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});