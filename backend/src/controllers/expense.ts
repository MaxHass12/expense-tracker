import express, { Request, Response } from "express";
import { ExpenseModel } from "../models/expense";

const expenseRouter = express.Router();

// TODO: add proper error handling with Next and middleware
// TODO: create post route with helpers.

expenseRouter.get("/", (_request: Request, response: Response) => {
  ExpenseModel.find({})
    .then((result) => response.status(200).send(result))
    .catch(() => response.status(500).send({ error: "could not fetch data" }));
});

// /**
//  * - Checks if req.body has valid newExpenseData
//  * - return the data if valid,
//  * - throws error otherwise
//  * @param body
//  * @returns
//  */
// const parseNewExpenseData = (body: unknown): NewExpenseData => {
//   if (!body || typeof body !== "object") {
//     throw new Error();
//   }

//   if (
//     "category" in body &&
//     typeof body.category === "string" &&
//     "description" in body &&
//     typeof body.description === "string" &&
//     "amount" in body &&
//     typeof body.amount === "number"
//   ) {
//     const newExpenseData: NewExpenseData = {
//       category: body.category,
//       description: body.description,
//       amount: body.amount,
//     };
//     return newExpenseData;
//   }

//   throw new Error();
// };

// expenseRouter.post("/api/expenses/", (req: Request, res: Response) => {
//   const newExpenseData: NewExpenseData = parseNewExpenseData(req.body);
//   const currentDay: string = new Date(Date.now()).toString();

//   const newExpense: Expense = {
//     id: Math.random(),
//     dateAdded: currentDay,
//     category: newExpenseData.category,
//     description: newExpenseData.description,
//     amount: newExpenseData.amount,
//   };

//   return res.status(201).json(newExpense);

//   //   expenses.push(newExpense);
//   //   return res.status(201).json(newExpense);
//   // } catch (error) {
//   //   return res
//   //     .status(400)
//   //     .send({ error: "Invalid Data. Could not create new expense" });
//   // }
// });

export default expenseRouter;
