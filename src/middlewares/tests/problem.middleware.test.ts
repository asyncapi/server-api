import request from 'supertest';

import { App } from '../../app';
import { ProblemException } from '../../exceptions/problem.exception';

import { createTestController } from '../../../tests/test.controller';

// problemMiddleware is added to every route
describe('problemMiddleware', () => {
  describe('[POST] /test', () => {
    it('should handle throwed exception', async () => {
      const TestController = createTestController({
        path: '/test',
        method: 'post',
        callback: () => {
          throw new ProblemException({
            type: 'custom-problem',
            title: 'Custom problem',
            status: 422,
          });
        },
      });
      const app = new App([new TestController()]);

      return await request(app.getServer())
        .post('/test')
        .send({})
        .expect(422, {
          type: ProblemException.createType('custom-problem'),
          title: 'Custom problem',
          status: 422,
        });
    });

    it('should not have executed when there was success call', async () => {
      const TestController = createTestController({
        path: '/test',
        method: 'post',
        callback: (_, res) => {
          res.status(200).send({ success: true });
        },
      });
      const app = new App([new TestController()]);

      return await request(app.getServer())
        .post('/test')
        .send({})
        .expect(200, {
          success: true,
        });
    });
  });
});
