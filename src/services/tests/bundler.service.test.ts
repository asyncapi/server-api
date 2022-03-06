import fs from 'fs';
import path from 'path';    
import {BundlerService} from '../bundler.service';

describe('BundlerService', () => {
  const bundlerService = new BundlerService();

  describe('.bundle()', () => {
    it('should bundle files', async () => {
      const files = [
        'D:\\Projects\\postman\\server-api\\src\\fixtures\\bundler\\signup.yaml',
        path.resolve(__dirname, '../../fixtures/bundler/login.yaml'),
      ];
      const options = {
        base: path.resolve(`${__dirname}/../../fixtures/bundler/output.yaml`),
      };

      try {
        const result = await bundlerService.bundle(files, options);
        const expected = fs.readFileSync(path.resolve('../../fixtures/bundler/output.yaml'), 'utf-8');     
        expect(result).toEqual(expected);
      } catch (e) {
        console.log('error in service test ',e);
      }
    });
  });
});