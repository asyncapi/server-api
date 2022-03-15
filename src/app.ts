import bodyParser from 'body-parser';
import compression from 'compression';
import config from 'config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { Controller } from './interfaces';

import { requestBodyValidationMiddleware } from './middlewares/request-body-validation.middleware';
import { problemMiddleware } from './middlewares/problem.middleware';

import { logger } from './utils/logger';

export class App {
  private app: express.Application;
  private port: string | number;
  private env: string;
  private v1: string = 'v1';

  constructor(controller: Controller[]) {
    this.app = express();
    this.port = process.env.PORT || 80;
    this.env = process.env.NODE_ENV || 'development';

    // initialize core middlewares
    this.initializeMiddlewares();
    // initialize validation middlewares
    this.initializeValidation();
    // initialize all controllers
    this.initializeControllers(controller);
    // initialize error handling
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info('=================================');
      logger.info(`= ENV: ${this.env}`);
      logger.info(`= 🚀 AsyncAPI Server API listening on the port ${this.port}`);
      logger.info('=================================');
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    const requestBodyLimit = config.get<string>('request.body.limit');

    this.app.use(cors({ origin: config.get('cors.origin'), credentials: config.get('cors.credentials') }));
    this.app.use(compression());
    this.app.use(bodyParser.text({ type: ['text/*'], limit: requestBodyLimit }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: requestBodyLimit }));
    this.app.use(bodyParser.json({ type: ['json', '*/json', '+json'], limit: requestBodyLimit }));
    this.app.use(helmet());
  }

  private initializeValidation() {
    this.app.use(requestBodyValidationMiddleware);
  }

  private initializeControllers(controller: Controller[]) {
    controller.forEach(controller => {
      // in the `openapi.yaml` we have prefix `v1` for all paths
      this.app.use('/v1/', controller.boot());
    });
  }

  private initializeErrorHandling() {
    this.app.use(problemMiddleware);
  }
}
