import { HydratedDocument } from "mongoose";
import UserModel from "../../models/users";
import ExpenseModel from "../../models/expense";
import { IUser, MonthlyExpenses } from "../../types";

interface CreateUserData {
  username: string;
  password: string;
}

const MINIMUM_LENGTH = 4;
const GUEST_USERNAME = "guest";

/**
 * - parses req.body for POST /user and POST /login
 * - expects body to only have username, password of type string
 * - also both of them should be of atleast the minimum length
 * - throws an error if invalid data
 * @param body
 * @returns an object with username and password
 */
const parseCreateUserData = (body: unknown): CreateUserData => {
  if (!body || typeof body !== "object") {
    const error = new Error("Unable to parse user input.");
    error.name = "InvalidUserInputError";
    throw error;
  }

  if (
    Object.keys(body).length === 2 &&
    "username" in body &&
    typeof body.username === "string" &&
    body.username.length >= MINIMUM_LENGTH &&
    "password" in body &&
    typeof body.password === "string" &&
    body.password.length >= MINIMUM_LENGTH
  ) {
    return {
      username: body.username,
      password: body.password,
    };
  }

  const error = new Error("Please enter valid username and password.");
  error.name = "InvalidUserInputError";
  throw error;
};

/**
 * - fetches user from DB based on id
 * - throws an error if user not found
 * @param id
 * @returns
 */
const findUserById = async (id: string): Promise<HydratedDocument<IUser>> => {
  const user = UserModel.findById(id);

  if (!user) {
    const error = new Error("userId Invalid.");
    error.name = "InvalidUserInputError";
    throw error;
  }

  // Since we have checked already for user not being null
  return user as unknown as HydratedDocument<IUser>;
};

/**
 * - fetches user from DB based on username
 * - throws an error if user not found
 * @param name
 * @returns
 */
const findUserByName = async (
  name: string
): Promise<HydratedDocument<IUser>> => {
  const user = await UserModel.findOne({ username: name });

  if (!user) {
    const error = new Error("username Invalid.");
    error.name = "InvalidUserInputError";
    throw error;
  }

  // Since we have checked already for user not being null
  return user as unknown as HydratedDocument<IUser>;
};

const clearGuestUserData = async () => {
  const guestUser: HydratedDocument<IUser> = await findUserByName(
    GUEST_USERNAME
  );

  // delete expenses
  const guestUserId = guestUser.id;
  ExpenseModel.deleteMany({ _userId: guestUserId });

  // delete reference to expense from guestUser
  const emptyMonthlyExpenses: MonthlyExpenses = {};
  guestUser.monthlyExpenses = emptyMonthlyExpenses;

  await guestUser.save();
};

export default {
  parseCreateUserData,
  findUserById,
  findUserByName,
  clearGuestUserData,
};
