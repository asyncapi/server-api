import request from 'supertest';
import mongoose from 'mongoose';

import { App } from '../../app';
// import { ProblemException } from '../../exceptions/problem.exception';

import {ShareController} from '../share.controller';

const asyncFile = {
  asyncapi: {
    asyncapi: '2.4.0',
    info: {
      title: 'Building MQTT API',
      version: '1.0.0',
      description: 'First prototype of building API using mosquitto broker',
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0',
      },
    },
    servers: {
      development: {
        url: 'test.mosquitto.org',
        protocol: 'mqtt',
        description: 'Mosquitto broker for development',
        variables: {
          port: {
            description:
              'Secure connection (TLS) is available through port 8883.',
            default: '1883',
          },
        },
      },
    },
    channels: {
      unitBalanceRequester: {
        description:
          'This topic publishes an event demanding building unit balance',
        subscribe: {
          summary:
            'This triggers a request action for each building about the balance',
          operationId: 'BalanceRequester',
          message: {
            $ref: '#/components/messages/lightBalanceRequester',
          },
        },
      },
      unitBalanceResponder: {
        description: 'This topic publishes event for building unit balance',
        publish: {
          summary: 'This triggers a balance event for building units measured',
          operationId: 'BalanceResponder',
          message: {
            $ref: '#/components/messages/lightMeasured',
          },
        },
      },
      unitBalanceUpdater: {
        description: 'This topic publishes event that updates unit balance',
        subscribe: {
          summary: 'This triggers a balance event for building units measured',
          operationId: 'UnitBalanceUpdater',
          message: {
            $ref: '#/components/messages/lightMeasured',
          },
        },
      },
    },
    components: {
      messages: {
        lightBalanceRequester: {
          name: 'lightBalanceRequester',
          title: 'Light Balance Requester',
          summary: 'Request balance from buildings',
          contentType: 'application/json',
          payload: {
            type: 'string',
          },
        },
        lightMeasured: {
          name: 'lightMeasured',
          title: 'Light measured',
          summary:
            'Inform about environmental lighting conditions of a particular streetlight.',
          contentType: 'application/json',
          payload: {
            type: 'object',
            properties: {
              buildingID: {
                type: 'integer',
                description: 'Building unique indentifier',
              },
              unit: {
                type: 'integer',
                description: 'Number of unit remaining from building',
              },
            },
          },
        },
      },
    },
  },
};

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/asyncapi'
  );
});

describe('ShareController', () => {
  describe('[POST] /share', () => {
    it('should return the spec ouput url', async () => {
      const app = new App([new ShareController()]);
      await app.init();

      return request(app.getServer())
        .post('/v1/share')
        .send(asyncFile)
        .expect(201);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});