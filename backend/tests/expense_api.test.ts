import mongoose from "mongoose";
import { ExpenseModel } from "../src/models/expense";
import supertest from "supertest";
import app from "../src/app";

const api = supertest(app);

describe("Tests for GET /api/expenses/:yearMonth", () => {
  describe("", () => {
    test("GET /api/expenses/:yearMonth does not work with invalid data", async () => {
      let response = await api.get("/api/expenses/foo");
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "Expecting a valid date in form YYYY-MM"
      );

      response = await api.get("/api/expenses/foo-bar");
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "Expecting a valid date in form YYYY-MM"
      );

      response = await api.get("/api/expenses/1899-01");
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "Expecting a valid date in form YYYY-MM"
      );

      response = await api.get("/api/expenses/2100-01");
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "Expecting a valid date in form YYYY-MM"
      );

      response = await api.get("/api/expenses/2022-00");
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "Expecting a valid date in form YYYY-MM"
      );

      response = await api.get("/api/expenses/2022-13");
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "Expecting a valid date in form YYYY-MM"
      );
    });

    test("GET /api/expenses/:yearMonth returns status 200 with valid data", async () => {
      let response = await api.get("/api/expenses/2022-02");
      expect(response.status).toBe(200);
    });
  });

  // beforeEach(async () => {
  //   await ExpenseModel.deleteMany({});

  //   const newExpense = new ExpenseModel({
  //     category: "Gas",
  //     description: "",
  //     amount: 50,
  //     createdAt: new Date(),
  //   });
  //   await newExpense.save();
  // });

  // test("Can Not Create a New Expense with Invalid Data", async () => {
  //   // No data send
  //   const response1 = await api.post("/api/expenses");
  //   expect(response1.status).toBe(400);
  //   expect(response1.body.error).toBe("Input fields missing or invalid.");

  //   // Invalid Category
  //   const response2 = await api
  //     .post("/api/expenses")
  //     .send({ category: "foo", description: "bar", amount: 50 });
  //   expect(response2.status).toBe(400);
  //   expect(response2.body.error).toBe("Input fields missing or invalid.");

  //   // Invalid description
  //   const response3 = await api
  //     .post("/api/expenses")
  //     .send({ category: "foo", description: 50, amount: 50 });
  //   expect(response3.status).toBe(400);
  //   expect(response3.body.error).toBe("Input fields missing or invalid.");

  //   // Invalid amount
  //   const response4 = await api
  //     .post("/api/expenses")
  //     .send({ category: "foo", description: "", amount: -1 });
  //   expect(response4.status).toBe(400);
  //   expect(response4.body.error).toBe("Input fields missing or invalid.");
  // });

  // test("Able to create expense with valid data", async () => {
  //   const response = await api
  //     .post("/api/expenses")
  //     .send({ category: "Gas", description: "", amount: 50 });

  //   expect(response.status).toBe(201);
  //   expect(response.body.category).toBe("Gas");
  //   expect(response.body.amount).toBe(50);

  //   expect(response.type).toBe("application/json");
  // });

  // afterAll(async () => {
  //   await mongoose.connection.close();
  // });
});

describe("Tests for POST /api/expenses", () => {
  beforeEach(async () => {
    await ExpenseModel.deleteMany({});
  });

  test("Can Not Create a New Expense with Invalid Data", async () => {
    // No data send
    const response1 = await api.post("/api/expenses");
    expect(response1.status).toBe(400);
    expect(response1.body.error).toBe("Input fields missing or invalid.");

    // Invalid Category
    const response2 = await api
      .post("/api/expenses")
      .send({ category: "foo", description: "bar", amount: 50 });
    expect(response2.status).toBe(400);
    expect(response2.body.error).toBe("Input fields missing or invalid.");

    // Invalid description
    const response3 = await api
      .post("/api/expenses")
      .send({ category: "foo", description: 50, amount: 50 });
    expect(response3.status).toBe(400);
    expect(response3.body.error).toBe("Input fields missing or invalid.");

    // Invalid amount
    const response4 = await api
      .post("/api/expenses")
      .send({ category: "foo", description: "", amount: -1 });
    expect(response4.status).toBe(400);
    expect(response4.body.error).toBe("Input fields missing or invalid.");
  });

  test("Able to create expense with valid data", async () => {
    const response = await api
      .post("/api/expenses")
      .send({ category: "Gas", description: "", amount: 50 });

    expect(response.status).toBe(201);
    expect(response.body.category).toBe("Gas");
    expect(response.body.amount).toBe(50);

    expect(response.type).toBe("application/json");
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
