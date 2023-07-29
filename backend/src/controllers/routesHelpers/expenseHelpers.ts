import {
  CreateNewExpenseData,
  ExpenseCategories,
  DateYMString,
  CategorizedExpensesForMonth,
  IExpense,
  IUser,
  MonthlyExpenses,
  Expense,
} from "../../types";
import usersHelpers from "./usersHelpers";
import ExpenseModel from "../../models/expense";
import helpers from "./helpers";
import { HydratedDocument } from "mongoose";

const MIN_YEAR_POSSIBLE = 1900;
const MAX_YEAR_POSSIBLE = 2099;
const JANUARY = 1;
const DECEMBER = 12;

// June dates are used for creating dummy data for June Month
// const JUNE_DATE = new Date("2023-06-10"); // for creating Dates in previous months
// const JUNE_YEAR_MONTH = "2023-06";

/**
 * - Attaches expense document to array corresponding to current YearMonth in user.monthlyExpenses
 * - Does not perform any input validation
 */
const _attachExpenseToUser = async (
  expense: HydratedDocument<IExpense>,
  user: HydratedDocument<IUser>
): Promise<void> => {
  let currentYearMonth: DateYMString = helpers.getCurrentMonthYear();
  // currentYearMonth = JUNE_YEAR_MONTH;
  // MongoDB does not recognize mutated elements as new elements
  // Thus, MongoDb does not save mutated elements.
  // Hence we are creating copy of both the object and the array, instead of mutating them
  const monthlyExpenseCopy: MonthlyExpenses = { ...user.monthlyExpenses };
  monthlyExpenseCopy[currentYearMonth] ||= [];
  monthlyExpenseCopy[currentYearMonth] = monthlyExpenseCopy[
    currentYearMonth
  ].concat(expense._id);
  user.monthlyExpenses = monthlyExpenseCopy;

  await user.save();
};

/**
 * - fetches expense from MongoDB
 * - throws error if expense not found
 * @param id
 * @returns
 */
const _findExpenseById = async (
  id: string
): Promise<HydratedDocument<IExpense>> => {
  const expense = await ExpenseModel.findById(id);

  if (!expense) {
    const error = new Error("expenseId Invalid.");
    error.name = "InvalidExpenseIDInternalError";
    throw error;
  }

  // We have already checked for non null expense
  return expense as unknown as HydratedDocument<IExpense>;
};

/**
 * - Checks if req.body has valid newExpenseData
 * - category should be of string and part of enum Categories value
 * - description should be a string
 * - amount should be a >= 0 number
 * - userId should be present and of string type
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

  const EXPENSE_CATEGORIES = Object.values(ExpenseCategories) as string[];

  if (
    "category" in body &&
    typeof body.category === "string" &&
    EXPENSE_CATEGORIES.includes(body.category) &&
    "description" in body &&
    typeof body.description === "string" &&
    "amount" in body &&
    typeof body.amount === "number" &&
    body.amount >= 0 &&
    "userId" in body &&
    typeof body.userId === "string"
  ) {
    const category = body.category as ExpenseCategories;
    const newExpenseData: CreateNewExpenseData = {
      category: category,
      description: body.description,
      amount: body.amount,
      userId: body.userId,
    };

    return newExpenseData;
  }

  const error = new Error("Input fields missing or invalid.");
  error.name = "InvalidExpenseInputError";
  throw error;
};

/**
 * - creates new Expense data in MongoDB
 * - except for userId assumes input is valid, performs no input validation
 * - If userId invalid throws an error
 * - Attaches the id of new expense to current month in user.monthlyExpenses
 * @param newExpenseData
 * @returns the saved new Expense
 */
const createNewExpense = async (newExpenseData: CreateNewExpenseData) => {
  // Find User
  const userId = newExpenseData.userId;
  const user: HydratedDocument<IUser> = await usersHelpers.findUserById(userId);

  // Create New Expense
  const newExpense: HydratedDocument<IExpense> = new ExpenseModel({
    category: newExpenseData.category,
    // createdAt: JUNE_DATE,
    createdAt: new Date(),
    description: newExpenseData.description,
    amount: newExpenseData.amount,
    _userId: user.id,
  });

  const savedExpense: HydratedDocument<IExpense> = await newExpense.save();

  // Attach Expense to User
  _attachExpenseToUser(savedExpense, user);

  // return the saved response
  return savedExpense;
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
 * @param userId
 * @param yearMonth
 * @returns grouped expenses by categories, sorted by total amount (highest first), removes category with no expense
 */
const getMonthsExpenses = async (
  userId: string,
  yearMonth: DateYMString
): Promise<CategorizedExpensesForMonth> => {
  // There is probably a better way to do it.
  // But due to my limited knowledge of MongoDB I am doing it this way

  // fetch user from DB
  const user: HydratedDocument<IUser> = await usersHelpers.findUserById(userId);

  // fetch Expenses from user
  const expensesIds = user.monthlyExpenses[yearMonth] || [];

  const expensePromises = expensesIds.map(async (id) => {
    const expense = await _findExpenseById(String(id));
    return expense.toJSON() as Expense; // True by definition
  });

  const userExpenses: Array<Expense> = await Promise.all(expensePromises);

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
  userExpenses.forEach((expense) => {
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
