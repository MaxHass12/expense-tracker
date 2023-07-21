import { useState, useEffect } from "react";
import axios from "axios";

import { Expense, NewExpense } from "../types";
import SingleExpense from "./components/SingleExpense";
import expenseService from "./services/expenses";
import Notification from "./components/Notification";

const App = () => {
  const [expenses, setExpenses] = useState<Array<Expense>>([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [monthYear, setMonthYear] = useState(() => {
    const currentDate = new Date();

    const currentMonth = currentDate.getMonth() + 1;
    const formattedCurrentMonth = // Prepend 0 is Month is less than 10 to make it 2 digits
      currentMonth < 10 ? "0" + String(currentMonth) : String(currentMonth);
    const currentYear = currentDate.getFullYear();

    return `${currentYear}-${formattedCurrentMonth}`;
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    expenseService.getAll().then((response) => {
      setExpenses(response.data);
    });
  }, []);

  const addEventHandler = (event: React.SyntheticEvent) => {
    event.preventDefault();

    const currentDate = new Date(Date.now());

    const newExpense: NewExpense = {
      id: Math.random(),
      dateAdded: currentDate.toLocaleString(),
      category: category,
      description: "",
      amount: +amount,
    };

    expenseService
      .create(newExpense)
      .then((response) => {
        setExpenses(expenses.concat(response.data));
        setCategory("");
        setAmount("");
        setMessage("New Expense Added");
        setTimeout(() => {
          setMessage(null);
        }, 5000);
      })
      .catch((error) => {
        console.log("Could not create expense: ", error.message);
      });
  };

  const monthYearChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthYear(e.target.value);
  };

  // monthYear is a string in format YYYY-MM
  // -1 because Months in JS Date starts from 0
  const filterByYear = Number(monthYear.split("-")[0]);
  const filterByMonth = Number(monthYear.split("-")[1]) - 1;

  const expensesToShow = expenses.filter((expense) => {
    const expenseDate = new Date(expense.dateAdded);

    const expenseYear = expenseDate.getFullYear();
    const expenseMonth = expenseDate.getMonth();

    return expenseYear === filterByYear && expenseMonth === filterByMonth;
  });

  return (
    <>
      <h1>Expenses</h1>
      <Notification message={message} />
      <form>
        <label htmlFor="monthYear">Show Expenses for: </label>
        <input
          type="month"
          id="monthYear"
          value={monthYear}
          onChange={monthYearChangeHandler}
        />
      </form>
      {expensesToShow.map((expense) => (
        <SingleExpense key={expense.id} expense={expense} />
      ))}
      <h2>Add Expense</h2>
      <form onSubmit={addEventHandler}>
        <div>
          <label htmlFor="category">Category: </label>
          <input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="category">Amount: </label>
          <input
            id="amount"
            type="number"
            onChange={(e) => setAmount(e.target.value)}
            value={amount}
          />
        </div>
        <div>
          <button type="submit">save</button>
        </div>
      </form>
    </>
  );
};

export default App;
