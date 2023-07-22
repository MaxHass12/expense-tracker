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
  response: Response,
  next: NextFunction
) => {
  logger.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  return next(error);
};

export default {
  requestLogger,
  unknownEndpoint,
  errorHandler,
};
