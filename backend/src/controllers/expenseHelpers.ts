import {
  CreateNewExpenseData,
  ExpenseCategories,
  DateYMString,
} from "../types";
import { ExpenseModel } from "../models/expense";

const MIN_YEAR_POSSIBLE = 1900;
const MAX_YEAR_POSSIBLE = 2099;
const JANUARY = 1;
const DECEMBER = 12;

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

/**
 * - checks if param from the URL is in the correct string format `YYYY-MM`
 * - If yes, converts type from `unknown` to `DateYMString` and returns the string
 * - Else, throws an error
 * @param param from the URL
 * @returns value in correct format
 */
const parseYearMonth = (param: unknown): DateYMString => {
  if (!param || typeof param !== "string") {
    const error = new Error("Unable to parse date input.");
    error.name = "InvalidDateInputError";
    throw error;
  }

  const dateStringArray: Array<string> = param.split("-");
  const year = Number(dateStringArray[0]);
  const month = Number(dateStringArray[1]);

  if (
    // dateStringArray is expected to be in format ['YYYY', 'MM']
    dateStringArray.length !== 2 ||
    // check validity of year
    Number.isNaN(year) ||
    year < MIN_YEAR_POSSIBLE ||
    year > MAX_YEAR_POSSIBLE ||
    // check validity of month
    Number.isNaN(month) ||
    month < JANUARY ||
    month > DECEMBER
  ) {
    const error = new Error("Expecting a valid date in form YYYY-MM");
    error.name = "InvalidDateInputError";
    throw error;
  }

  // param should be in the given format at this point
  return param as DateYMString;
};

export default {
  parseNewExpenseData,
  createNewExpense,
  parseYearMonth,
};
