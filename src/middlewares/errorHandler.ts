import { NextFunction, Request, Response } from "express";
import { ValidationError as YupValidationError } from "yup";
import { InternalServerError, ValidationError } from "../errors";
import { Logger } from "pino";

export interface ErrorHandlerDependencies {
  logger: Logger;
}

const createErrorHandler = (dependencies: ErrorHandlerDependencies) =>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  function errorHandler(err: any, req: Request, res: Response, _: NextFunction) {
    const message = err.message;
    let status = err.status || new InternalServerError().status;
    const name = err.name || new InternalServerError().name;

    if (err instanceof YupValidationError) {
      status = new ValidationError("").status;
    }

    dependencies.logger.error({
      req: {
        body: req.body,
        headers: req.headers,
        query: req.query,
        method: req.method,
        params: req.params,
        url: req.url,
      },
      err,
    });
    res.status(status).json({ message, name, status });
  };

export default createErrorHandler;
