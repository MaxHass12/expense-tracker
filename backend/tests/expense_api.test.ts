import mongoose from "mongoose";
import ExpenseModel from "../src/models/expense";
import supertest from "supertest";
import app from "../src/app";
import UserModel from "../src/models/users";
import { DateYMString } from "../src/types";

const api = supertest(app);

const GUEST_USERNAME = "guest";
const GUEST_PASSWORD = "password";
const NEW_EXPENSE_DATA = {
  category: "Gas",
  description: "foo bar",
  amount: 50,
};

// HELPERS (helper functions start with an underscore)

/**
 * - creates and logins guest user with username and password declared as constants
 * @returns token generated from login-in the guest user
 */
const _createAndLoginGuestUser = async () => {
  await api
    .post("/api/users")
    .send({ username: GUEST_USERNAME, password: GUEST_PASSWORD });

  const loginResponse = await api
    .post("/api/login")
    .send({ username: GUEST_USERNAME, password: GUEST_PASSWORD });

  const token = loginResponse.body.token;

  return token;
};

/**
 * - fetches expense from DB
 * - throws error if expense not found
 * @param expenseId
 * @returns Expense
 */
const _fetchExpenseInDB = async (expenseId: string) => {
  const expense = await ExpenseModel.findById(expenseId);

  if (!expense) {
    throw new Error("Could not fetch expense from DB");
  } else {
    return expense;
  }
};

/**
 * - fetches guestUser from DB, get username from constants
 * - throws an error if guestUser not found
 * @returns guest user
 */
const _fetchGuestUserInDb = async () => {
  const guestUser = await UserModel.findOne({ username: GUEST_USERNAME });

  if (!guestUser) {
    throw new Error("Could not fetch guest user from DB");
  } else {
    return guestUser;
  }
};

/**
 * @returns current year month in 'YYYY-MM' format
 */
const _getCurrentYearMonth = (): DateYMString => {
  const currentDate: Date = new Date();
  const currentMonth = currentDate.getMonth() + 1; // To maake JAN 1 instead of 0
  const currentYear = currentDate.getFullYear();

  const currentMonthString =
    currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;

  return `${currentYear}-${currentMonthString}` as DateYMString;
};

/**
 * - Creates new expense in the backend
 * - user is extracted from the auth token
 * @param auth
 */
const _createDummyExpense = async (auth: string) => {
  await api
    .post("/api/expenses")
    .send(NEW_EXPENSE_DATA)
    .set("Authorization", auth);
};

const CURRENT_YEAR_MONTH = _getCurrentYearMonth();

// MAIN TEST SUITE
describe("Tests for GET /api/expenses/:yearMonth", () => {
  let authorization: string;
  beforeAll(async () => {
    // clear the database
    await ExpenseModel.deleteMany({});
    await UserModel.deleteMany({});

    // create and login user
    const token = await _createAndLoginGuestUser();
    authorization = `Bearer ${token}`;

    // create a dummy expense
    await _createDummyExpense(authorization);
  });

  test("GET /api/expenses/2023-07 does not work without authorization", async () => {
    const response = await api.get(`/api/expenses/${CURRENT_YEAR_MONTH}`);
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Authentication Failed");
  });

  test("GET /api/expenses/ does not work", async () => {
    const response = await api
      .get(`/api/expenses/`)
      .set("Authorization", authorization);

    expect(response.status).toBe(404);
  });

  test("GET /api/expenses/:yearMonth does not work with invalid data", async () => {
    let response = await api
      .get("/api/expenses/foo")
      .set("Authorization", authorization);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Expecting a valid date in form YYYY-MM");

    response = await api
      .get("/api/expenses/foo-bar")
      .set("Authorization", authorization);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Expecting a valid date in form YYYY-MM");

    response = await api
      .get("/api/expenses/1899-01")
      .set("Authorization", authorization);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Expecting a valid date in form YYYY-MM");

    response = await api
      .get("/api/expenses/2100-01")
      .set("Authorization", authorization);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Expecting a valid date in form YYYY-MM");

    response = await api
      .get("/api/expenses/2022-00")
      .set("Authorization", authorization);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Expecting a valid date in form YYYY-MM");

    response = await api
      .get("/api/expenses/2022-13")
      .set("Authorization", authorization);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Expecting a valid date in form YYYY-MM");

    response = await api
      .get("/api/expenses/2022-7")
      .set("Authorization", authorization);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Expecting a valid date in form YYYY-MM");
  });

  test("GET /api/expenses/:yearMonth returns status 200 with valid data", async () => {
    let response = await api
      .get("/api/expenses/2022-02")
      .set("Authorization", authorization);

    expect(response.status).toBe(200);
    expect(response.body.totalAmount).toEqual(0);
    expect(response.body.data).toBeDefined();
    expect(response.body.data[0].amount).toBe(0);
  });

  test("GET /api/expenses/:monthYear works with valid data ", async () => {
    const response = await api
      .get(`/api/expenses/${CURRENT_YEAR_MONTH}`)
      .set("Authorization", authorization);

    expect(response.status).toBe(200);
    expect(response.body.totalAmount).toBe(NEW_EXPENSE_DATA.amount);
    expect(response.body.data[0].category).toBe(NEW_EXPENSE_DATA.category);
    expect(response.body.data[0].amount).toBe(NEW_EXPENSE_DATA.amount);
  });
});

describe("Tests for POST /api/expenses", () => {
  let authorization: string;

  beforeEach(async () => {
    await ExpenseModel.deleteMany({});
    await UserModel.deleteMany({});
    const token = await _createAndLoginGuestUser();
    authorization = `Bearer ${token}`;
  });
  test("Can not create a new expense without authorization", async () => {
    // No Authorization header
    const response1 = await api.post("/api/expenses").send(NEW_EXPENSE_DATA);
    expect(response1.status).toBe(401);
    expect(response1.body.error).toBe("Authentication Failed");

    // Invalid Authorization header
    const response2 = await api
      .post("/api/expenses")
      .set("Authorization", "Bearer foobar")
      .send(NEW_EXPENSE_DATA);

    expect(response2.status).toBe(401);
    expect(response2.body.error).toBe("Authentication Failed");
  });

  test("Can Not Create a New Expense with Invalid Data", async () => {
    // No data send
    const response1 = await api
      .post("/api/expenses")
      .set("Authorization", authorization);

    expect(response1.status).toBe(400);
    expect(response1.body.error).toBe("Received Invalid Expense Data");

    // Invalid Category
    const response2 = await api
      .post("/api/expenses")
      .send({ category: "foo", description: "bar", amount: 50 })
      .set("Authorization", authorization);

    expect(response2.status).toBe(400);
    expect(response2.body.error).toBe("Received Invalid Expense Data");

    // Invalid description
    const response3 = await api
      .post("/api/expenses")
      .send({ category: "foo", description: 50, amount: 50 })
      .set("Authorization", authorization);

    expect(response3.status).toBe(400);
    expect(response3.body.error).toBe("Received Invalid Expense Data");

    // Invalid amount
    const response4 = await api
      .post("/api/expenses")
      .send({ category: "foo", description: "", amount: -1 })
      .set("Authorization", authorization);

    expect(response4.status).toBe(400);
    expect(response4.body.error).toBe("Received Invalid Expense Data");

    // Extra fields
    const response5 = await api
      .post("/api/expenses")
      .send({ category: "foo", description: "bar", amount: 100, extra: true })
      .set("Authorization", authorization);

    expect(response5.status).toBe(400);
    expect(response5.body.error).toBe("Received Invalid Expense Data");
  });

  test("Able to create expense with valid data", async () => {
    const response = await api
      .post("/api/expenses")
      .send({ category: "Gas", description: "", amount: 50 })
      .set("Authorization", authorization);

    expect(response.status).toBe(201);
    expect(response.type).toBe("application/json");

    expect(response.body.category).toBe("Gas");
    expect(response.body.amount).toBe(50);

    const expenseId = response.body.id;
    const expenseInDb = await _fetchExpenseInDB(expenseId);

    const guestUser = await _fetchGuestUserInDb();

    const guestUsersCurrentMonthExpenseIds =
      guestUser.monthlyExpenses[CURRENT_YEAR_MONTH];

    expect(expenseInDb._userId.toString()).toBe(guestUser.id);
    expect(guestUsersCurrentMonthExpenseIds).toBeDefined();

    if (guestUsersCurrentMonthExpenseIds) {
      expect(guestUsersCurrentMonthExpenseIds[0].toString()).toBe(expenseId);
    }
  });
});

// Disconnect at last
afterAll(async () => {
  await mongoose.connection.close();
});
