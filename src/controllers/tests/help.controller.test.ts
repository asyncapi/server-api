import request from 'supertest';
import { App } from '../../app';
import { HelpController } from '../help.controller';
import { getAppOpenAPI } from '../../utils/app-openapi';

jest.mock('../../utils/app-openapi', () => ({
  getAppOpenAPI: jest.fn(),
}));

describe('HelpController', () => {
  let app;
  beforeAll(async () => {
    app = new App([new HelpController()]);
    await app.init();
  });

  describe('[GET] /help', () => {
    it('should return all commands', async () => {
      (getAppOpenAPI as jest.Mock).mockResolvedValue({
        paths: {
          '/validate': {},
          '/parse': {},
          '/generate': {},
          '/convert': {},
          '/bundle': {},
          '/help': {},
          '/diff': {}
        }
      });

      const response = await request(app.getServer())
        .get('/v1/help')
        .expect(200);

      expect(response.body).toEqual([
        {
          command: 'validate',
          url: '/help/validate'
        },
        {
          command: 'parse',
          url: '/help/parse'
        },
        {
          command: 'generate',
          url: '/help/generate'
        },
        {
          command: 'convert',
          url: '/help/convert'
        },
        {
          command: 'bundle',
          url: '/help/bundle'
        },
        {
          command: 'help',
          url: '/help/help'
        },
        {
          command: 'diff',
          url: '/help/diff'
        }
      ]);
    });

    it('should return 404 error for an invalid command', async () => {
      const response = await request(app.getServer())
        .get('/v1/help/invalidCommand')
        .expect(404);
        
      expect(response.body).toEqual({
        type: 'https://api.asyncapi.com/problem/invalid-asyncapi-command',
        title: 'Invalid AsyncAPI Command',
        status: 404,
        detail: 'The given AsyncAPI command is not valid.'
      });
    });

    it('should return 404 error for a command without a method', async () => {
      (getAppOpenAPI as jest.Mock).mockResolvedValue({
        paths: {
          '/someCommand': {}
        }
      });

      const response = await request(app.getServer())
        .get('/v1/help/someCommand')
        .expect(404);
        
      expect(response.body).toEqual({
        type: 'https://api.asyncapi.com/problem/invalid-asyncapi-command',
        title: 'Invalid AsyncAPI Command',
        status: 404,
        detail: 'The given AsyncAPI command is not valid.'
      });
    });       
  });
});