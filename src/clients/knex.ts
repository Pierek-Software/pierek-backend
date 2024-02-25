import knex from "knex";
import { types } from "pg";
import { knexConfig } from "../config";

types.setTypeParser(types.builtins.DATE, (value: string) => value);
types.setTypeParser(types.builtins.TIMESTAMP, (value: string) => value);
types.setTypeParser(types.builtins.TIMESTAMPTZ, (value: string) => value);

export default knex(knexConfig);
