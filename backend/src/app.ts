import express from "express";
import expenseRouter from "./controllers/expense";
import usersRouter from "./controllers/users";
import loginRouter from "./controllers/login";
import middleware from "./utils/middleware";
import config from "./utils/config";
import logger from "./utils/logger";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

// connect to mongoDB
mongoose.set("strictQuery", false);

logger.info("connecting to MongoDB");

mongoose
  .connect(config.MONGODB_URI as string)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB:", error.message);
  });

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static("build"));
app.use(middleware.requestLogger);

// routes
app.use("/api/expenses", middleware.userIdExtractor, expenseRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

// error handler and unknown endpoint
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
