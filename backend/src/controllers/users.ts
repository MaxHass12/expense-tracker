import bcrypt from "bcrypt";
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

usersRouter.get(
  "/",
  catchError(async (_req, res: Response) => {
    const users = await UserModel.find({});
    return res.status(200).send(users);
  })
);

usersRouter.post(
  "/",
  catchError(async (req: Request, res: Response) => {
    const { username, password } = usersHelpers.parseCreateUserData(req.body);

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const currentYearMonth = helpers.getCurrentMonthYear();
    const user = new UserModel({
      username,
      passwordHash,
      isAdmin: false,
      monthlyExpenses: {},
    });

    user.monthlyExpenses[currentYearMonth] = [];

    const savedUser = await user.save();

    res.status(201).json(savedUser);
  })
);

export default usersRouter;
