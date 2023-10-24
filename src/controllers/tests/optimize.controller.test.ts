import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';

import { OptimizeController } from '../../controllers/optimize.controller';

const validAsyncAPI = {
  asyncapi: '2.0.0',
  info: {
    title: 'Streetlights API',
    version: '1.0.0'
  },
  channels: {
    'smartylighting/event/{streetlightId}/lighting/measured': {
      parameters: {
        streetlightId: {
          schema: {
            type: 'string'
          }
        }
      },
      subscribe: {
        operationId: 'receiveLightMeasurement',
        traits: [
          {
            bindings: {
              kafka: {
                clientId: 'my-app-id'
              }
            }
          }
        ],
        message: {
          name: 'lightMeasured',
          title: 'Light measured',
          contentType: 'application/json',
          traits: [
            {
              headers: {
                type: 'object',
                properties: {
                  'my-app-header': {
                    type: 'integer',
                    minimum: 0,
                    maximum: 100
                  }
                }
              }
            }
          ],
          payload: {
            type: 'object',
            properties: {
              lumens: {
                type: 'integer',
                minimum: 0
              },
              sentAt: {
                type: 'string',
                format: 'date-time'
              }
            }
          }
        }
      }
    },
    'smartylighting/action/{streetlightId}/turn/on': {
      parameters: {
        streetlightId: {
          schema: {
            type: 'string'
          }
        }
      },
      publish: {
        operationId: 'turnOn',
        traits: [
          {
            bindings: {
              kafka: {
                clientId: 'my-app-id'
              }
            }
          }
        ],
        message: {
          name: 'turnOnOff',
          title: 'Turn on/off',
          traits: [
            {
              headers: {
                type: 'object',
                properties: {
                  'my-app-header': {
                    type: 'integer',
                    minimum: 0,
                    maximum: 100
                  }
                }
              }
            }
          ],
          payload: {
            type: 'object',
            properties: {
              sentAt: {
                $ref: '#/components/schemas/sentAt'
              }
            }
          }
        }
      }
    }
  },
  components: {
    messages: {
      unusedMessage: {
        name: 'unusedMessage',
        title: 'This message is not used in any channel.'
      }
    },
    schemas: {
      sentAt: {
        type: 'string',
        format: 'date-time'
      }
    }
  }
};
const optimizedAsyncAPI = {
  asyncapi: '2.0.0',
  info: {
    title: 'Streetlights API',
    version: '1.0.0'
  },
  channels: {
    'smartylighting/event/{streetlightId}/lighting/measured': {
      parameters: {
        streetlightId: {
          $ref: '#/components/parameters/parameter-1'
        }
      },
      subscribe: {
        operationId: 'receiveLightMeasurement',
        traits: [
          {
            bindings: {
              kafka: {
                clientId: 'my-app-id'
              }
            }
          }
        ],
        message: {
          name: 'lightMeasured',
          title: 'Light measured',
          contentType: 'application/json',
          traits: [
            {
              headers: {
                $ref: '#/components/schemas/schema-1'
              }
            }
          ],
          payload: {
            type: 'object',
            properties: {
              lumens: {
                type: 'integer',
                minimum: 0
              },
              sentAt: {
                $ref: '#/components/schemas/sentAt'
              }
            }
          }
        }
      }
    },
    'smartylighting/action/{streetlightId}/turn/on': {
      parameters: {
        streetlightId: {
          $ref: '#/components/parameters/parameter-1'
        }
      },
      publish: {
        operationId: 'turnOn',
        traits: [
          {
            bindings: {
              kafka: {
                clientId: 'my-app-id'
              }
            }
          }
        ],
        message: {
          name: 'turnOnOff',
          title: 'Turn on/off',
          traits: [
            {
              headers: {
                $ref: '#/components/schemas/schema-1'
              }
            }
          ],
          payload: {
            type: 'object',
            properties: {
              sentAt: {
                $ref: '#/components/schemas/sentAt'
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      sentAt: {
        type: 'string',
        format: 'date-time'
      },
      'schema-2': {
        type: 'integer',
        minimum: 0,
        maximum: 100
      },
      'schema-1': {
        type: 'object',
        properties: {
          'my-app-header': {
            $ref: '#/components/schemas/schema-2'
          }
        }
      }
    },
    parameters: {
      'parameter-1': {
        schema: {
          type: 'string'
        }
      }
    }
  }
};

describe('OptimizeController', () => {
  describe('[POST] /optimize', () => {
    it('should optimize AsyncAPI document', async () => {
      const app = new App([new OptimizeController()]);
      await app.init();

      await request(app.getServer())
        .post('/v1/optimize')
        .send({
          asyncapi: validAsyncAPI,
        })
        .expect(200, {
          optimized: optimizedAsyncAPI
        });
    });

    it('should return report', async () => {
      const app = new App([new OptimizeController()]);
      await app.init();

      await request(app.getServer())
        .post('/v1/optimize')
        .send({
          asyncapi: validAsyncAPI,
          report: true,
        })
        .expect(200, {
          optimized: optimizedAsyncAPI,
          report: {
            reuseComponents: [
              {
                path: 'channels.smartylighting/event/{streetlightId}/lighting/measured.subscribe.message.payload.properties.sentAt',
                action: 'reuse',
                target: 'components.schemas.sentAt'
              }
            ],
            removeComponents: [
              {
                path: 'components.messages.unusedMessage',
                action: 'remove'
              }
            ],
            moveToComponents: [
              {
                path: 'channels.smartylighting/event/{streetlightId}/lighting/measured.subscribe.message.traits[0].headers.properties.my-app-header',
                action: 'move',
                target: 'components.schemas.schema-2'
              },
              {
                path: 'channels.smartylighting/event/{streetlightId}/lighting/measured.subscribe.message.traits[0].headers',
                action: 'move',
                target: 'components.schemas.schema-1'
              },
              {
                path: 'channels.smartylighting/event/{streetlightId}/lighting/measured.parameters.streetlightId',
                action: 'move',
                target: 'components.parameters.parameter-1'
              },
              {
                path: 'channels.smartylighting/action/{streetlightId}/turn/on.publish.message.traits[0].headers.properties.my-app-header',
                action: 'reuse',
                target: 'components.schemas.schema-2'
              },
              {
                path: 'channels.smartylighting/action/{streetlightId}/turn/on.publish.message.traits[0].headers',
                action: 'reuse',
                target: 'components.schemas.schema-1'
              },
              {
                path: 'channels.smartylighting/action/{streetlightId}/turn/on.parameters.streetlightId',
                action: 'reuse',
                target: 'components.parameters.parameter-1'
              }
            ]
          },
        });
    });

    it('should throw error with invalid AsyncAPI document', async () => {
      const app = new App([new OptimizeController()]);
      await app.init();

      await request(app.getServer())
        .post('/v1/optimize')
        .send({
          asyncapi: {
            asyncapi: '2.2.0',
            info: {
              tite: 'My API', // spelled wrong on purpose to throw an error in the test
              version: '1.0.0'
            },
            channels: {},
          }
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
            asyncapi: '2.2.0',
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