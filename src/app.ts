import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import config from 'config';
import cors from 'cors';
import express from 'express';

import { Controller } from "./interfaces";
import { documentValidationMiddleware } from './middlewares/document-validation.middleware';
import { requestBodyValidationMiddleware } from './middlewares/request-body-validation.middleware';
import { problemMiddleware } from './middlewares/problem.middleware'
import { logger } from './utils/logger';

export class App {
  private app: express.Application;
  private port: string | number;
  private env: string;

  constructor(controller: Controller[]) {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.env = process.env.NODE_ENV || 'development';

    this.initializeMiddlewares();
    // initialize validation middlewares
    this.initializeValidation();
    // initialize all controllers
    this.initializeControllers(controller);
    // initialize error handlings
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
    this.app.use(compression());
    this.app.use(bodyParser.text({ type: ["text/*"], limit: '5mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
    this.app.use(bodyParser.json({ type: ["json", "*/json", "+json"], limit: '5mb' }));
    this.app.use(cookieParser());
  }

  private initializeValidation() {
    this.app.use(documentValidationMiddleware);
    this.app.use(requestBodyValidationMiddleware);
  }

  private initializeControllers(controller: Controller[]) {
    controller.forEach(controller => {
      this.app.use('/', controller.boot());
    });
  }

  private initializeErrorHandling() {
    this.app.use(problemMiddleware);
  }
}
