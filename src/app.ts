import express, { Application } from "express";
import helmet from "helmet";
import { ConfigInterface } from "./config";
import { Logger } from "pino";
import { Knex } from "knex";
import createErrorHandler from "./middlewares/errorHandler";
import createLogger from "./middlewares/logger";
import DatabaseService from "./services/DatabaseService";
import clientRouter from "./routers/clientRouter";
import adminRouter from "./routers/adminRouter";
import bodyParser from "body-parser";
import cors from "cors";
require("express-async-errors");

export interface AppDependencies {
  config: ConfigInterface;
  logger: Logger;
  knex: Knex;
  services: {
    databaseService: DatabaseService;
  };
}

export class ExpressApplication {
  app: Application;

  constructor(private dependencies: AppDependencies) {
    this.app = express();

    this.registerMiddlewares();
    this.registerErrorHandler();
    this.registerHealthCheckEndpoint();
    this.registerRoutes();
  }

  registerMiddlewares() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(createLogger(this.dependencies.config, this.dependencies.logger));
  }

  registerRoutes() {
    this.app.use("/v1", clientRouter({ databaseService: this.dependencies.services.databaseService }));
    this.app.use("/v1/admin", adminRouter({ databaseService: this.dependencies.services.databaseService }));
  }

  registerHealthCheckEndpoint() {
    this.app.get("/health", (_, res) => res.send("OK"));
    this.app.get("/ping", (_, res) => res.send("OK"));
  }

  registerErrorHandler() {
    const errorHandler = createErrorHandler({ logger: this.dependencies.logger });
    this.app.use(errorHandler);
  }

  async start() {
    const server = this.app.listen(this.dependencies.config.port, () =>
      this.dependencies.logger.info(`Server started on port ${this.dependencies.config.port}`),
    );

    process.on("SIGINT", () => server.close(() => this.dependencies.logger.info("HTTP server closed")));
  }
}
