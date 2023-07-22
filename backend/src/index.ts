import { config } from "dotenv";
config();

import express, { Request, Response, NextFunction } from "express";
import { NewExpenseData, Expense } from "./types";
import { ExpenseModel } from "./models/expense";

const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path} ${JSON.stringify(req.body)}`);
  next();
};

const app = express();

import cors from "cors";
app.use(cors());

app.use(express.static("build"));
app.use(express.json());
app.use(requestLogger);

app.get("/", (_request: Request, response: Response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/expenses", (_request: Request, response: Response) => {
  ExpenseModel.find({})
    .then((result) => response.status(200).send(result))
    .catch(() => response.status(500).send({ error: "could not fetch data" }));
});

/**
 * - Checks if req.body has valid newExpenseData
 * - return the data if valid,
 * - throws error otherwise
 * @param body
 * @returns
 */
const parseNewExpenseData = (body: unknown): NewExpenseData => {
  if (!body || typeof body !== "object") {
    throw new Error();
  }

  if (
    "category" in body &&
    typeof body.category === "string" &&
    "description" in body &&
    typeof body.description === "string" &&
    "amount" in body &&
    typeof body.amount === "number"
  ) {
    const newExpenseData: NewExpenseData = {
      category: body.category,
      description: body.description,
      amount: body.amount,
    };
    return newExpenseData;
  }

  throw new Error();
};

app.post("/api/expenses/", (req: Request, res: Response) => {
  const newExpenseData: NewExpenseData = parseNewExpenseData(req.body);
  const currentDay: string = new Date(Date.now()).toString();

  const newExpense: Expense = {
    id: Math.random(),
    dateAdded: currentDay,
    category: newExpenseData.category,
    description: newExpenseData.description,
    amount: newExpenseData.amount,
  };

  return res.status(201).json(newExpense);

  //   expenses.push(newExpense);
  //   return res.status(201).json(newExpense);
  // } catch (error) {
  //   return res
  //     .status(400)
  //     .send({ error: "Invalid Data. Could not create new expense" });
  // }
});

const unknownEndpoint = (_req: Request, res: Response) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (
  error: Error,
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  return next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
