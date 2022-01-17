import { NextFunction, Request, Response, Router } from 'express';

import { Controller } from '../src/interfaces';

interface Path {
  path: string,
  method: 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head',
  callback: (req: Request, res: Response, next: NextFunction) => any;
  middlewares?: Array<(req: Request, res: Response, next: NextFunction) => any>;
}

export function createTestController(paths: Path | Path[]) {
  return class implements Controller {
    public basepath = '/';

    public boot(): Router {
      const router = Router();

      const p = Array.isArray(paths) ? paths : [paths];
      p.forEach(path => {
        router[path.method](
          path.path,
          ...(path.middlewares || []),
          path.callback,
        );
      });

      return router;
    }
  };
}
