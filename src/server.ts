import config from "./config";
import { pino } from "pino";

import { ExpressApplication } from "./app";
import DatabaseService from "./services/DatabaseService";
import knex from "./clients/knex";

const logger = pino();

const databaseService = new DatabaseService({
  knex,
});

const app = new ExpressApplication({
  config,
  logger,
  knex,
  services: {
    databaseService,
  },
});

app.start();
