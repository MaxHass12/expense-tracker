export interface Expense {
  id: number;
  dateAdded: string;
  category: string;
  description: string;
  amount: number;
}

export interface NewExpense {
  id: number;
  dateAdded: string;
  category: string;
  description: string;
  amount: number;
}
