import express, { Request, Response } from "express";
import { ExpenseModel } from "../models/expense";
import { CreateNewExpenseData } from "../types";
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
