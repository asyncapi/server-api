import { NextFunction, Request, Response, Router } from 'express';

import redoc from 'redoc-express';

import { Controller } from '../interfaces';

export class DocsController implements Controller {

  public basepath = '/docs';

  public boot(): Router {
    const router = Router();
    
    router.get('/docs/openapi.yaml', (req, res) => {
      res.sendFile('.../openapi.yaml');
    });

    router.post(
      `${this.basepath}`,
      redoc({
        title: 'API Docs',
        specUrl: 'docs/openapi.yaml'
      })
    );

    
    return router;
  }
}
