import bodyParser from 'body-parser';
import config from 'config';
import cors from 'cors';
import express from 'express';

import { Routes } from "./interfaces";
import { problemMiddleware } from './middlewares/problem.middleware'
import { logger } from './utils/logger';

export class App {
  public app: express.Application;
  public port: string | number;
  public env: string;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.env = process.env.NODE_ENV || 'development';

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    // initialize error handling at last
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`= ENV: ${this.env}`);
      logger.info(`= 🚀 AsyncAPI Server API listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(cors({ origin: config.get('cors.origin'), credentials: config.get('cors.credentials') }));
    this.app.use(bodyParser.text({ type: 'text/plain', limit: '5mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(express.json());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(problemMiddleware);
  }
}
