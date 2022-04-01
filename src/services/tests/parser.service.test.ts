import { AsyncAPIDocument } from '@asyncapi/parser';
import { Request } from 'express';

import { ParserService } from '../parser.service';
import { ProblemException } from '../../exceptions/problem.exception';

describe('ParserService', () => {
  const parserService = new ParserService();
  const req = {
    header() { return ''; },
  } as unknown as Request;

  describe('.parse()', () => {
    it('should parse spec with single file reference', async () => {      
      let err: ProblemException;
      let parsed: AsyncAPIDocument;
      try {
        ({ parsed } = await parserService.parse({
          document: {
            asyncapi: '2.0.0',
            info: {
              title: 'Super test',
              version: '1.0.0'
            },
            channels: {
              someChannel: {
                $ref: './some-file.json#/components/someChannel',
              }
            }
          },
          references: {
            './some-file.json': {
              components: {
                someChannel: {
                  publish: {},
                }
              }
            },
          }
        }, req));
      } catch (e) {
        err = e;
      }

      expect(err).toEqual(undefined);
      expect(parsed.json().channels.someChannel).toEqual({ publish: {} });
    });

    it('should parse spec with file references (more than one)', async () => {      
      let err: ProblemException;
      let parsed: AsyncAPIDocument;
      try {
        ({ parsed } = await parserService.parse({
          document: {
            asyncapi: '2.0.0',
            info: {
              title: 'Super test',
              version: '1.0.0'
            },
            channels: {
              someChannel1: {
                $ref: './some-file.json#/components/someChannel',
              },
              someChannel2: {
                $ref: '../../another-file.json#/components/someChannel',
              }
            }
          },
          references: {
            './some-file.json': {
              components: {
                someChannel: {
                  publish: {},
                }
              }
            },
            '../../another-file.json': {
              components: {
                someChannel: {
                  subscribe: {},
                }
              }
            },
          }
        }, req));
      } catch (e) {
        err = e;
      }

      expect(err).toEqual(undefined);
      expect(parsed.json().channels.someChannel1).toEqual({ publish: {} });
      expect(parsed.json().channels.someChannel2).toEqual({ subscribe: {} });
    });

    it('should parse spec with file references (one use another one)', async () => {      
      let err: ProblemException;
      let parsed: AsyncAPIDocument;
      try {
        ({ parsed } = await parserService.parse({
          document: {
            asyncapi: '2.0.0',
            info: {
              title: 'Super test',
              version: '1.0.0'
            },
            channels: {
              someChannel1: {
                $ref: '../some-file.json#/components/someChannel',
              },
              someChannel2: {
                $ref: '../../another-file.json#/components/someChannel',
              }
            }
          },
          references: {
            '../some-file.json': {
              components: {
                someChannel: {
                  $ref: '../another-file.json#/components/someChannel',
                }
              }
            },
            '../../another-file.json': {
              components: {
                someChannel: {
                  subscribe: {},
                }
              }
            },
          }
        }, req));
      } catch (e) {
        err = e;
      }

      expect(err).toEqual(undefined);
      expect(parsed.json().channels.someChannel1).toEqual({ subscribe: {} });
      expect(parsed.json().channels.someChannel2).toEqual({ subscribe: {} });
    });

    it('should parse spec with http references', async () => {      
      let err: ProblemException;
      let parsed: AsyncAPIDocument;
      try {
        ({ parsed } = await parserService.parse({
          document: {
            asyncapi: '2.0.0',
            info: {
              title: 'Super test',
              version: '1.0.0'
            },
            channels: {
              someChannel1: {
                $ref: './some-file.json#/components/someChannel',
              },
              someChannel2: {
                subscribe: {
                  message: {
                    $ref: 'https://raw.githubusercontent.com/asyncapi/spec/master/examples/simple.yml#/components/messages/UserSignedUp',
                  }
                }
              }
            }
          },
          references: {
            './some-file.json': {
              components: {
                someChannel: {
                  publish: {},
                }
              }
            },
          }
        }, req));
      } catch (e) {
        err = e;
      }

      expect(err).toEqual(undefined);
      expect(parsed.json().channels.someChannel1).toEqual({ publish: {} });
      expect(typeof parsed.json().channels.someChannel2.subscribe.message.payload).toEqual('object');
    });

    it('should throw error due to non existing reference', async () => {
      let err: ProblemException;
      let parsed: AsyncAPIDocument;
      try {
        ({ parsed } = await parserService.parse({
          asyncapi: '2.0.0',
          info: {
            title: 'Super test',
            version: '1.0.0'
          },
          channels: {
            someChannel: {
              $ref: './some-file.json#/components/someChannel',
            }
          }
        }, req));
      } catch (e) {
        err = e;
      }

      expect(parsed).toEqual(undefined);
      expect(err).toBeInstanceOf(ProblemException);
      expect(ProblemException.toJSON(err).type).toEqual(ProblemException.createType('dereference-error'));
    });

    it('should throw error due to invalid AsyncAPI document', async () => {
      let err: ProblemException;
      let parsed: AsyncAPIDocument;
      try {
        ({ parsed } = await parserService.parse({
          asyncapi: '2.0.0',
          info: {
            tite: 'My API',
            version: '1.0.0'
          },
          channels: {}
        }, req));
      } catch (e) {
        err = e;
      }

      expect(parsed).toEqual(undefined);
      expect(err).toBeInstanceOf(ProblemException);
      expect(ProblemException.toJSON(err)).toEqual({
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
