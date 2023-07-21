import { Expense } from "../../types";

const SingleExpense = (props: { expense: Expense }) => {
  const { expense } = props;
  const expenseDate = new Date(expense.dateAdded);

  return (
    <p>
      {expenseDate.toDateString()}, {expense.category}, ${expense.amount}
    </p>
  );
};

export default SingleExpense;
