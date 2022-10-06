import { ConvertService } from '../convert.service';
import { ProblemException } from '../../exceptions/problem.exception';

const validJsonAsyncAPI2_0_0 = {
  asyncapi: '2.0.0',
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

describe('ConvertService', () => {
  const convertService = new ConvertService();

  describe('.convert()', () => {
    it('should throw error that the converter cannot convert to a lower version', async () => {
      let err: ProblemException | undefined;
      try {
        await convertService.convert(validJsonAsyncAPI2_0_0, '1.2.0');
      } catch (e) {
        err = e;
      }

      expect(err).toEqual(new ProblemException({
        type: 'internal-converter-error',
        title: 'Could not convert document',
        status: 422,
        detail: 'Cannot downgrade from 2.0.0 to 1.2.0.',
      }));
    });

    it('should pass when converting to 2.4.0 version', async () => {
      const converted = await convertService.convert(validJsonAsyncAPI2_0_0, '2.4.0');

      expect(converted).toEqual({
        asyncapi: '2.4.0',
        info: {
          title: 'Super test',
          version: '1.0.0'
        },
        channels: {},
      });
    });

    it('should pass when converting to latest version', async () => {
      const converted = await convertService.convert(validJsonAsyncAPI2_0_0);

      expect(converted).toEqual({
        asyncapi: '2.5.0',
        info: {
          title: 'Super test',
          version: '1.0.0'
        },
        channels: {},
      });
    });

    it('should correctly convert JSON to YAML', async () => {
      const converted = await convertService.convert(validJsonAsyncAPI2_0_0, '2.4.0', 'yaml');

      expect(converted).toEqual(validYamlAsyncAPI2_4_0.trimStart());
    });
  });
});
