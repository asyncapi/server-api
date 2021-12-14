import fs from 'fs';
import path from 'path';

import { GeneratorService } from '../generator.service';
import { createTempDirectory, removeTempDirectory } from '../../utils/temp-dir';
import { prepareParserConfig } from '../../utils/parser';

describe('GeneratorService', () => {
  const generatorService = new GeneratorService();

  describe('.generate()', () => {
    it('should generate given template to the destination dir', async () => {
      const asyncapi = {
        asyncapi: '2.2.0',
        info: {
          title: 'Test Service',
          version: '1.0.0',
        },
        channels: {},
      };
      const template = '@asyncapi/html-template';
      const parameters = {
        version: '2.1.37',
      };
  
      const tmpDir = createTempDirectory();
      try {
        await generatorService.generate(
          JSON.stringify(asyncapi),
          template,
          parameters,
          tmpDir,
          prepareParserConfig(),
        );
    
        expect(fs.existsSync(path.join(tmpDir, 'template'))).toEqual(true);
        expect(fs.existsSync(path.join(tmpDir, 'template/index.html'))).toEqual(true);
      } catch (e: any) {
        removeTempDirectory(tmpDir);
      }
    });
  });
});
