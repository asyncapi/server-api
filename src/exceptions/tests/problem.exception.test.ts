import { ProblemException } from '../problem.exception';

describe('ProblemException', () => {
  describe('constructor', () => {
    test('should create proper error', () => {
      try {
        throw new ProblemException({
          type: 'some-type',
          title: 'Some problem',
          status: 422,
          customField: 'customValue',
        });
      } catch (e: unknown) {
        const err = e as ProblemException;
        expect(err.name).toEqual('ProblemException');
        expect(err.message).toEqual('Some problem');
        expect(err.type).toEqual(`${ProblemException.URL_PREFIX}some-type`);
        expect(err.title).toEqual('Some problem');
        expect(err.status).toEqual(422);
        expect(err.detail).toEqual(undefined);
        expect(err.instance).toEqual(undefined);
      }
    });
  });

  describe('.createType()', () => {
    test('should create proper type', () => {
      const type = ProblemException.createType('some-type');
      expect(type).toEqual(`${ProblemException.URL_PREFIX}some-type`);
    });
  });

  describe('.toJSON()', () => {
    test('should create proper json', () => {
      try {
        throw new ProblemException({
          type: 'some-type',
          title: 'Some problem',
          status: 422,
          customField: 'customValue',
        });
      } catch (e) {
        expect((e as ProblemException).toJSON()).toEqual({
          type: ProblemException.createType('some-type'),
          title: 'Some problem',
          status: 422,
          customField: 'customValue',
        });
      }
    });

    test('should create proper json with stack', () => {
      try {
        throw new ProblemException({
          type: 'some-type',
          title: 'Some problem',
          status: 422,
          customField: 'customValue',
        });
      } catch (e) {
        expect((e as ProblemException).toJSON({ includeStack: true })).toEqual({
          type: ProblemException.createType('some-type'),
          title: 'Some problem',
          status: 422,
          customField: 'customValue',
          stack: (e as Error).stack,
        });
      }
    });
  });
});
