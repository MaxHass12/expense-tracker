import { Request, Response, NextFunction } from "express";

import logger from "./logger";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "./config";
import { RequestWithUserId } from "../types";

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

/**
 * - middleware to check for authentication via authentication header
 * - if authentication token exists and is valid:
 * - then, attaches the decoded userId to request
 * - else, throws an error
 * @param req
 * @param _res
 * @param next
 */
const userIdExtractor = (
  req: RequestWithUserId,
  _res: Response,
  next: NextFunction
) => {
  const authorization = req.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    const error = new Error("No Authorization Header Found");
    error.name = "AuthenticationError";
    throw error;
  }

  const token = authorization.replace("Bearer ", "");

  const decodedToken = jwt.verify(
    token,
    config.SECRET as string // a valid SECRET should be exported from config
  ) as JwtPayload; // Else it throws an Error, hence type forcing is safe.

  if (!decodedToken.id) {
    const error = new Error("Token Invalid");
    error.name = "AuthenticationError";
    throw error;
  }

  // If authentication successfull, attaching userId to request
  req.userId = decodedToken.id;
  next();
};

const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(error);

  if (error.name === "InvalidExpenseInputError") {
    return res.status(400).send({ error: "Received Invalid Expense Data" });
  } else if (error.name === "InvalidDateInputError") {
    return res
      .status(400)
      .json({ error: "Expecting a valid date in form YYYY-MM" });
  } else if (error.name === "InvalidUserInputError") {
    return res.status(400).json({ error: error.message });
  } else if (error.name === "MongoServerError") {
    return res.status(500).json({ error: "Internal Server Error" });
  } else if (error.name === "InvalidExpenseIDInternalError") {
    return res.status(500).json({ error: "Internal Server Error" });
  } else if (
    error.name === "JsonWebTokenError" ||
    error.name === "AuthenticationError" ||
    error.name === "UserCreationDuringProductionError"
  ) {
    return res.status(401).json({ error: "Authentication Failed" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  } else {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  userIdExtractor,
};
