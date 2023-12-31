import { Request } from "express";

// To represent Year Month in YYYY-MM format
// Inspired from https://javascript.plainenglish.io/type-safe-date-strings-66b6dc58658a

type d = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0;
type oneToNine = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type MM = `0${oneToNine}` | `1${0 | 1 | 2}`;
type YYYY = `19${d}${d}` | `20${d}${d}`;
// type DD = `${0}${oneToNine}` | `${1 | 2}${d}` | `3${0 | 1}`;

export type DateYMString = `${YYYY}-${MM}`;
// type DateYMDString = `${DateYMString}-${DD}`;

// Expense Categories
export enum ExpenseCategories {
  Baby = "Baby",
  Car = "Car",
  Gas = "Gas",
  EatingOut = "EatingOut",
  Entertainment = "Entertainment",
  Groceries = "Groceries",
  Insurance = "Insurance",
  Medical = "Medical",
  Miscellaneous = "Miscellaneous",
  Rent = "Rent",
  Travel = "Travel",
}

// Expected format of data for POST /api/expenses
export type CreateNewExpenseData = {
  category: ExpenseCategories;
  description: string;
  amount: number;
};

// Format of the public interface of single expense data (not how it is stored in MongoDB)
// Type of JSON representation of an Expense document
export type Expense = {
  id: string;
  createdAt: string;
  category: ExpenseCategories;
  description: string;
  amount: number;
};

// Expense detail for a single category
type CategoryExpenseDetail = {
  category: ExpenseCategories;
  amount: number;
  expenses: Array<Expense>;
};

// Format of a category-wise data for single month
// Public interface of data send from backend to frontend
export type CategorizedExpensesForMonth = Array<CategoryExpenseDetail>;

// Format of Expense Document for Mongoose
import { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  createdAt: Date;
  category: string;
  description: string;
  amount: number;
  _userId: Schema.Types.ObjectId;
}

// type of MonthlyExpense object stored under each user
export type MonthlyExpenses = {
  -readonly [key in DateYMString]+?: Array<Schema.Types.ObjectId>;
};

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  isAdmin: Boolean;
  monthlyExpenses: MonthlyExpenses;
}

// Request with authentication
export interface RequestWithUserId extends Request {
  userId?: string;
}
