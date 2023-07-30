import express, { Response } from "express";
import {
  CreateNewExpenseData,
  DateYMString,
  CategorizedExpensesForMonth,
  IExpense,
  RequestWithUserId,
} from "../types";
import expenseHelpers from "./routesHelpers/expenseHelpers";
import catchError from "../utils/catchError";
import { HydratedDocument } from "mongoose";

const expenseRouter = express.Router();

expenseRouter.get(
  "/:yearMonth",
  catchError(async (req: RequestWithUserId, res: Response) => {
    const userId = req.userId as string; // middleware ensures that userId is present
    const yearMonth: DateYMString = expenseHelpers.parseYearMonth(
      req.params.yearMonth
    );

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
  catchError(async (req: RequestWithUserId, res: Response) => {
    // middleware will ensure than userId is attached to request
    const userId: string = req.userId as string;

    const newExpenseData: CreateNewExpenseData =
      expenseHelpers.parseNewExpenseData(req.body);

    const newExpense: HydratedDocument<IExpense> =
      await expenseHelpers.createNewExpense(newExpenseData, userId);

    res.status(201).json(newExpense);
  })
);

export default expenseRouter;
