import { Expense } from "../../types";

const SingleExpense = (props: { expense: Expense }) => {
  const { expense } = props;
  const expenseDate = new Date(expense.createdAt);

  return (
    <p>
      {expenseDate.toDateString()}, {expense.category}, ${expense.amount}
    </p>
  );
};

export default SingleExpense;
