import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';

import { ConvertController } from '../convert.controller';

const validAsyncAPI2_0_0 = `
asyncapi: 2.0.0
info:
  title: Super test
  version: 1.0.0

servers:
  default:
    url: 'test:{port}'
    description: Test broker
    variables:
      port:
        description: test
    protocol: mqtt

components:
  messages:
    lightMeasured:
      summary: >-
        Inform about environmental lighting conditions for a particular
        streetlight.
      payload:

  schemas:
    lightMeasuredPayload:
      type: object
      properties:
        lumens:
          type: integer
          minimum: 0
          description: Light intensity measured in lumens.

channels:
  'test':
    publish:
      message:
        $ref: '#/components/messages/lightMeasured'
`;

describe('ConvertController', () => {
  describe('[POST] /convert', () => {
    it('should throw error with invalid version', async () => {
      const app = new App([new ConvertController()]);

      return await request(app.getServer())
        .post('/convert')
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
        .expect(400, {
          type: ProblemException.createType('invalid-json'),
          title: 'Bad Request',
          status: 400,
          detail: 'Invalid version parameter'
        });
    });

    it('should pass when converting to latest version', async () => {
      const app = new App([new ConvertController()]);

      return await request(app.getServer())
        .post('/convert')
        .send({
          asyncapi: validAsyncAPI2_0_0,
          version: '2.2.0'
        })
        .expect(200, {
          asyncapi: {
            asyncapi: '2.2.0',
            info: {
              title: 'Super test',
              version: '1.0.0'
            },
            servers: {
              default: {
                url: 'test:{port}',
                description: 'Test broker',
                variables: {
                  port: {
                    description: 'test'
                  }
                },
                protocol: 'mqtt'
              }
            },
            components: {
              messages: {
                lightMeasured: {
                  summary: 'Inform about environmental lighting conditions for a particular streetlight.',
                  payload: null
                }
              },
              schemas: {
                lightMeasuredPayload: {
                  type: 'object',
                  properties: {
                    lumens: {
                      type: 'integer',
                      minimum: 0,
                      description: 'Light intensity measured in lumens.'
                    }
                  }
                }
              }
            },
            channels: {
              test: {
                publish: {
                  message: {
                    $ref: '#/components/messages/lightMeasured'
                  }
                }
              }
            }
          }
        });
    });
  });
});
