// To represent Year Month in YYYY-MM format
// Inspired from https://javascript.plainenglish.io/type-safe-date-strings-66b6dc58658a

type d = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0;
type oneToNine = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type MM = `0${oneToNine}` | `1${0 | 1 | 2}`;
type YYYY = `19${d}${d}` | `20${d}${d}`;
// type DD = `${0}${oneToNine}` | `${1 | 2}${d}` | `3${0 | 1}`;

export type DateYMString = `${YYYY}-${MM}`;
// type DateYMDString = `${DateYMString}-${DD}`;

export type NewExpenseData = {
  category: string;
  description: string;
  amount: number;
};

export type Expense = {
  id: number;
  dateAdded: string;
  category: string;
  description: string;
  amount: number;
};
