import {
  CreateNewExpenseData,
  ExpenseCategories,
  DateYMString,
  CategorizedExpensesForMonth,
  Expense,
} from "../types";
import { ExpenseModel } from "../models/expense";

const MIN_YEAR_POSSIBLE = 1900;
const MAX_YEAR_POSSIBLE = 2099;
const JANUARY = 1;
const DECEMBER = 12;

/**
 * private method for returning current year-month in YYYY-MM format
 * @returns
 */
const _getCurrentMonthYear = (): string => {
  // // for creating Dates in previous months
  // const juneDate = new Date("2023-06-10");
  // const currentDate = juneDate;
  // --
  const currentDate: Date = new Date();
  const currentMonth = currentDate.getMonth() + 1; // To maake JAN 1 instead of 0
  const currentYear = currentDate.getFullYear();

  const currentMonthString =
    currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;

  return `${currentYear}-${currentMonthString}`;
};

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
  // const juneDate = new Date("2023-06-10"); // for creating Dates in previous months
  const newExpense = new ExpenseModel({
    ...newExpenseData,
    createdAt: new Date(),
    _yearMonth: _getCurrentMonthYear(),
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
  const yearString = dateStringArray[0];
  const monthString = dateStringArray[1];
  const year = Number(yearString);
  const month = Number(monthString);

  if (
    // dateStringArray is expected to be in format ['YYYY', 'MM']
    dateStringArray.length !== 2 ||
    // check validity of year
    yearString.length !== 4 || // year should be YYYY
    Number.isNaN(year) ||
    year < MIN_YEAR_POSSIBLE ||
    year > MAX_YEAR_POSSIBLE ||
    // check validity of month
    monthString.length !== 2 || // month should be MM
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

/**
 * - fetches all the expenses in the DB as per the yearMonth provided
 * - group-by the expenses data on category field
 * @param yearMonth
 * @returns grouped expenses by categories, sorted by total amount (highest first), removes category with no expense
 */
const getMonthsExpenses = async (
  yearMonth: DateYMString
): Promise<CategorizedExpensesForMonth> => {
  // fetch expensed from DB
  const expensesByYearMonth: Array<Expense> = await ExpenseModel.find({
    _yearMonth: yearMonth,
  });

  // Initializing an empty result object, will be populated later
  const expenseCategories = Object.values(ExpenseCategories);

  const result: CategorizedExpensesForMonth = expenseCategories.map(
    (category) => {
      return {
        category: category,
        amount: 0,
        expenses: [],
      };
    }
  );

  // Looping through expenses fetched from DB
  //  - Will update each category in `results` based on single expense
  expensesByYearMonth.forEach((expense) => {
    const expenseCategory: ExpenseCategories = expense.category;

    const categoryIndexInResult: number = result.findIndex(
      (item) => item.category === expenseCategory
    );
    const categoryItemInResult = result[categoryIndexInResult];

    categoryItemInResult.amount += expense.amount;
    categoryItemInResult.expenses.push(expense);
  });

  // sort by amount
  result.sort((expense1, expense2) => expense2.amount - expense1.amount);

  return result;
};

/**
 * reduces expenseData to the sum of individual categorie's amounts
 * @param expenseData
 * @returns
 */
const getMonthsTotalAmount = (
  expenseData: CategorizedExpensesForMonth
): number => {
  return expenseData.reduce(
    (total, expenseDetails) => total + expenseDetails.amount,
    0
  );
};

export default {
  parseNewExpenseData,
  createNewExpense,
  parseYearMonth,
  getMonthsExpenses,
  getMonthsTotalAmount,
};
