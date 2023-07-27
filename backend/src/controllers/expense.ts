import express, { Request, Response } from "express";
import { ExpenseModel } from "../models/expense";
import { CreateNewExpenseData, DateYMString } from "../types";
import expenseHelpers from "./expenseHelpers";
import catchError from "../utils/catchError";

const expenseRouter = express.Router();

expenseRouter.get(
  "/",
  catchError(async (_req: Request, res: Response) => {
    const expenses = await ExpenseModel.find({});
    return res.status(200).json(expenses);
  })
);

// TODO - implement the helper functions, write tests for the route and implement the frontend
expenseRouter.get(
  "/:yearMonth",
  catchError(async (req: Request, res: Response) => {
    const yearMonth: DateYMString = expenseHelpers.parseYearMonth(
      req.params.yearMonth
    );
    // const expenseData = expenseHelpers.getExpensesByCategories(req.params.yearMonth);
    return res.status(200).send(yearMonth);
  })
);

expenseRouter.post(
  "/",
  catchError(async (req: Request, res: Response) => {
    await ExpenseModel.find({});

    const newExpenseData: CreateNewExpenseData =
      expenseHelpers.parseNewExpenseData(req.body);

    const newExpense = await expenseHelpers.createNewExpense(newExpenseData);
    res.status(201).json(newExpense);
  })
);

export default expenseRouter;
