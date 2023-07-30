import bcrypt from "bcryptjs";
import express, { Request, Response } from "express";
import UserModel from "../models/users";
import // CreateNewExpenseData,
// DateYMString,
// CategorizedExpensesForMonth,
"../types";
import usersHelpers from "./routesHelpers/usersHelpers";
import helpers from "./routesHelpers/helpers";

import catchError from "../utils/catchError";

const usersRouter = express.Router();

usersRouter.post(
  "/",
  catchError(async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      // No User creation possible in production
      const error = new Error("Can not send POST /users in production");
      error.name = "UserCreationDuringProductionError";
      throw error;
    }

    const { username, password } = usersHelpers.parseCreateUserData(req.body);

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const currentYearMonth = helpers.getCurrentMonthYear();
    const user = new UserModel({
      username,
      passwordHash,
      monthlyExpenses: {},
    });

    // Since mongo will not save empty `montlyExpenses`, we are initializing
    // a field within it
    user.monthlyExpenses[currentYearMonth] = [];

    const savedUser = await user.save();

    res.status(201).json(savedUser);
  })
);

export default usersRouter;
