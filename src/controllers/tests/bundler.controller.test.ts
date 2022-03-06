import request from 'supertest';

import { App } from '../../app';

import { BundlerController } from '../bundler.controller';

describe('BundlerController', () => {
  describe('[POST] /bundle', () => {
    it('should bundle files', async () => {
      const app = new App([new BundlerController()]);
      return request(app.getServer())
        .post('/v1/bundle')
        .send({
          files: ['../../fixtures/bundler/signup.yaml','../../fixtures/bundler/login.yaml'],
          options: {
            base: '../../fixtures/bundler/output.yaml',
          }
        })
        .expect(200);
    });
  });    
});