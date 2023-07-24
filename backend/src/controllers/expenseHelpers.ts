import { CreateNewExpenseData, ExpenseCategories } from "../types";
import { ExpenseModel } from "../models/expense";

/**
 * - Checks if req.body has valid newExpenseData
 * - category should be of string and part of enum Categories value
 * - description should be a string
 * - amount should be a >= 0 number
 * - return the data if valid,
 * - throws `InvalidNewExpenseInputError` error otherwise
 * @param body
 * @returns
 */
const parseNewExpenseData = (body: unknown): CreateNewExpenseData => {
  if (!body || typeof body !== "object") {
    const error = new Error("Unable to parse input.");
    error.name = "InvalidExpenseInputError";
    throw error;
  }

  if (
    "category" in body &&
    typeof body.category === "string" &&
    (Object.values(ExpenseCategories) as string[]).includes(body.category) &&
    "description" in body &&
    typeof body.description === "string" &&
    "amount" in body &&
    typeof body.amount === "number" &&
    body.amount >= 0
  ) {
    const category = body.category as ExpenseCategories;
    const newExpenseData: CreateNewExpenseData = {
      category: category,
      description: body.description,
      amount: body.amount,
    };

    return newExpenseData;
  }

  const error = new Error("Input fields missing or invalid.");
  error.name = "InvalidExpenseInputError";
  throw error;
};

/**
 * - creates new Expense data in MongoDB
 * - assumes input is valid, performs no input validation
 * @param newExpenseData
 * @returns the returned value from `save()` from Mongo Model
 */
const createNewExpense = async (newExpenseData: CreateNewExpenseData) => {
  const newExpense = new ExpenseModel({
    ...newExpenseData,
    createdAt: new Date(),
  });

  const result = await newExpense.save();
  return result;
};

export default {
  parseNewExpenseData,
  createNewExpense,
};
