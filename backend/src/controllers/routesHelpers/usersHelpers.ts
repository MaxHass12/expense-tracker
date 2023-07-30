import { HydratedDocument } from "mongoose";
import UserModel from "../../models/users";
import ExpenseModel from "../../models/expense";
import { IUser, MonthlyExpenses } from "../../types";
import helpers from "./helpers";

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
    const error = new Error("Unable to parse Create User Data.");
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

  const error = new Error("Invalid Username or Password.");
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
    const error = new Error("Can not fetch user through ID in DB");
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
    const error = new Error("Unable to find user by name in DB");
    error.name = "InvalidUserInputError";
    throw error;
  }

  // Since we have checked already for user not being null
  return user as unknown as HydratedDocument<IUser>;
};

/**
 * - Clears guest user data to the initial dummy data
 * - Gets guest username from the constant
 */
const clearGuestUserData = async () => {
  const guestUser: HydratedDocument<IUser> = await findUserByName(
    GUEST_USERNAME
  );

  // delete expenses associted with guestUser.id
  const guestUserId = guestUser.id;
  ExpenseModel.deleteMany({ _userId: guestUserId });

  // To delete reference to expenses from guestUser.montlyExpenses,
  // We are creating a new empty object and saving it as guestUser.monthlyExpenses
  const currentYearMonth = helpers.getCurrentMonthYear();

  const emptyMonthlyExpenses: MonthlyExpenses = {};
  emptyMonthlyExpenses[currentYearMonth] = []; // since MongoDB will not save empty montlyExpenses

  guestUser.monthlyExpenses = emptyMonthlyExpenses;

  await guestUser.save();
};

export default {
  parseCreateUserData,
  findUserById,
  findUserByName,
  clearGuestUserData,
};
