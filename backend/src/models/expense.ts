import mongoose from "mongoose";
import { ExpenseCategories, DateYMString } from "../types";

interface IExpense {
  createdAt: Date;
  _yearMonth: DateYMString;
  category: string;
  description: string;
  amount: number;
}

const expenseSchema = new mongoose.Schema<IExpense>({
  createdAt: { type: Date, required: true },
  _yearMonth: { type: String, required: true },
  category: {
    type: String,
    enum: Object.values(ExpenseCategories),
    required: true,
  },
  description: { type: String },
  amount: { type: Number, required: true, min: 0 },
});

expenseSchema.set("toJSON", {
  transform: (_, returnedObject) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    returnedObject.id = returnedObject._id.toString();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    returnedObject.createdAt = returnedObject.createdAt.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject._yearMonth;
  },
});

export const ExpenseModel = mongoose.model("Expense", expenseSchema);
