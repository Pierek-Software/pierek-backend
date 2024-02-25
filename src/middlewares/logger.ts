import { NextFunction, Request, Response } from "express";
import { Logger } from "pino";
import { ConfigInterface } from "../config";

const createLogger = (config: ConfigInterface, logger: Logger) => (req: Request, res: Response, next: NextFunction) => {
  if (config.debug === false) {
    return next();
  }

  const start = process.hrtime();

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const responseTime = (seconds * 1e3 + nanoseconds / 1e6).toFixed(2);

    logger.info({
      request: {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        query: req.query,
        body: req.body,
      },
      response: {
        statusCode: res.statusCode,
      },
      responseTime: responseTime,
    });
  });

  next();
};

export default createLogger;
