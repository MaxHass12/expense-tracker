export interface Expense {
  id: number;
  createdAt: string;
  category: string;
  description: string;
  amount: number;
}

export type CreateNewExpenseData = {
  category: ExpenseCategories;
  description: string;
  amount: number;
};

export enum ExpenseCategories {
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
