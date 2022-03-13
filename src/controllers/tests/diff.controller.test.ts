import request from 'supertest';
import { App } from '../../app';

import { DiffController } from '../../controllers/diff.controller';

describe('DiffController', () => {
  describe('[POST] /diff', () => {
    it('should diff files', async () => {
      const app = new App([new DiffController()]);
      return request(app.getServer())
        .post('/v1/diff')
        .send({
          asyncapis: ['./diff/asyncapi-diff-test-1.yaml','./diff/asyncapi-diff-test-2.yaml']
        })
        .expect(200);
    });
  });    
});