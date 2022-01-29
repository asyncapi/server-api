import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';
import { ALL_SPECS } from '../../interfaces';

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
    it('should throw error with invalid version', () => {
      const app = new App([new ConvertController()]);

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
                allowedValues: ALL_SPECS
              },
              message: 'must be equal to one of the allowed values'
            }
          ]
        });
    });

    it('should pass when converting to latest version', () => {
      const app = new App([new ConvertController()]);

      return request(app.getServer())
        .post('/v1/convert')
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
