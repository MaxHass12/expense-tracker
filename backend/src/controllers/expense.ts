import express, { Request, Response } from "express";
import {
  CreateNewExpenseData,
  DateYMString,
  CategorizedExpensesForMonth,
  IExpense,
} from "../types";
import ExpenseModel from "../models/expense";
import expenseHelpers from "./routesHelpers/expenseHelpers";
import catchError from "../utils/catchError";
import { HydratedDocument } from "mongoose";

const expenseRouter = express.Router();

expenseRouter.get(
  "/",
  catchError(async (_req: Request, res: Response) => {
    const expenses = await ExpenseModel.find({});
    return res.status(200).json(expenses);
  })
);

const GUEST_USER_ID = "64c4869a89166f9f9958453b";

expenseRouter.get(
  "/:yearMonth",
  catchError(async (req: Request, res: Response) => {
    const yearMonth: DateYMString = expenseHelpers.parseYearMonth(
      req.params.yearMonth
    );

    const userId = GUEST_USER_ID;

    const expenseData: CategorizedExpensesForMonth =
      await expenseHelpers.getMonthsExpenses(userId, yearMonth);

    const totalAmount: number =
      expenseHelpers.getMonthsTotalAmount(expenseData);

    return res
      .status(200)
      .json({ data: expenseData, totalAmount: totalAmount });
  })
);

expenseRouter.post(
  "/",
  catchError(async (req: Request, res: Response) => {
    const newExpenseData: CreateNewExpenseData =
      expenseHelpers.parseNewExpenseData(req.body);

    const newExpense: HydratedDocument<IExpense> =
      await expenseHelpers.createNewExpense(newExpenseData);

    res.status(201).json(newExpense);
  })
);

export default expenseRouter;
