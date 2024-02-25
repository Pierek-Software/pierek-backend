/* eslint-disable @typescript-eslint/no-var-requires */
import { ObjectSchema, boolean, number, object, string } from "yup";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

export interface ConfigInterface {
  port: number;
  databaseHost: string;
  databasePort: number;
  databaseUser: string;
  databasePassword: string;
  databaseDatabase: string;
  debug: boolean;
  adminKey: string;
}

const configObject = {
  port: process.env.PORT ? +process.env.PORT : undefined,
  databaseHost: process.env.DATABASE_HOST,
  databasePort: process.env.DATABASE_PORT ? +process.env.DATABASE_PORT : undefined,
  databaseUser: process.env.DATABASE_USER,
  databasePassword: process.env.DATABASE_PASSWORD,
  databaseDatabase: process.env.DATABASE_DATABASE,
  debug: process.env.DEBUG === "true" ? true : false,
  adminKey: process.env.ADMIN_KEY,
};

const configSchema: ObjectSchema<ConfigInterface> = object({
  port: number().required(),
  databaseHost: string().required(),
  databasePort: number().required(),
  databaseUser: string().required(),
  databasePassword: string().required(),
  databaseDatabase: string().required(),
  debug: boolean().required(),
  adminKey: string().required(),
});

const config = configSchema.validateSync(configObject);

export const knexConfig = {
  client: "pg",
  ssl: {
    rejectUnauthorized: false,
  },
  connection: {
    host: config.databaseHost,
    port: config.databasePort,
    user: config.databaseUser,
    password: config.databasePassword,
    database: config.databaseDatabase,
  },
};

export default config;
