import { Request, Response, NextFunction } from "express";

import logger from "./logger";

/**
 * - Logs request details method, URL, body
 * - Hides password if present
 * @param request
 * @param _response
 * @param next
 */
const requestLogger = (
  request: Request,
  _response: Response,
  next: NextFunction
): void => {
  const { method, path } = request;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const bodyCopy = { ...request.body }; // Dont want to mutate `request.body`

  if (bodyCopy.password) {
    bodyCopy.password = "********";
  }
  logger.info(`${method} ${path} ${JSON.stringify(bodyCopy)}`);

  next();
};

/**
 * - To be invoked at end
 * @param _request
 * @param response
 */
const unknownEndpoint = (_request: Request, response: Response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (
  error: Error,
  _request: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(error);

  if (error.name === "InvalidExpenseInputError") {
    return res.status(400).send({ error: error.message });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  return next(error);
};

export default {
  requestLogger,
  unknownEndpoint,
  errorHandler,
};
