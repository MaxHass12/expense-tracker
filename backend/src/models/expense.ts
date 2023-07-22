import mongoose from "mongoose";

interface IExpense {
  date: string;
  category: string;
  description: string;
  amount: number;
}

const expenseSchema = new mongoose.Schema<IExpense>({
  date: String,
  category: String,
  description: String,
  amount: Number,
});

expenseSchema.set("toJSON", {
  transform: (_, returnedObject) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export const ExpenseModel = mongoose.model("Expense", expenseSchema);
