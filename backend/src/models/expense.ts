import mongoose from "mongoose";
import { ExpenseCategories, IExpense } from "../types";

const expenseSchema = new mongoose.Schema<IExpense>({
  createdAt: { type: Date, required: true },
  category: {
    type: String,
    enum: Object.values(ExpenseCategories),
    required: true,
  },
  description: { type: String },
  amount: { type: Number, required: true, min: 0 },
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

expenseSchema.set("toJSON", {
  transform: (_, returnedObject) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    returnedObject.id = returnedObject._id.toString();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    returnedObject.createdAt = returnedObject.createdAt.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject._userId;
  },
});

const ExpenseModel = mongoose.model<IExpense>("Expense", expenseSchema);

export default ExpenseModel;
