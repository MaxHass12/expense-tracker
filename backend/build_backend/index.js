"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const requestLogger = (req, _res, next) => {
    console.log(`${req.method} ${req.path} ${JSON.stringify(req.body)}`);
    next();
};
const unknownEndpoint = (_req, res) => {
    res.status(404).send({ error: "unknown endpoint" });
};
const app = (0, express_1.default)();
// eslint-disable-next-line @typescript-eslint/semi, @typescript-eslint/no-var-requires
const cors = require("cors");
app.use(express_1.default.json());
app.use(requestLogger);
app.use(cors());
app.use(express_1.default.static("build"));
const expenses = [
    {
        id: 0.9313621720190981,
        dateAdded: "2023-06-10T04:00:00.000Z",
        category: "grocery",
        description: "foo foo",
        amount: 40,
    },
    {
        id: 0.27057122017025703,
        dateAdded: "2023-06-20T04:00:00.000Z",
        category: "gas",
        description: "foo foo",
        amount: 50,
    },
    {
        id: 0.19971020148937524,
        dateAdded: "2023-07-10T04:00:00.000Z",
        category: "grocery",
        description: "foo foo",
        amount: 70,
    },
    {
        id: 0.034153401317661425,
        dateAdded: "2023-07-20T04:00:00.000Z",
        category: "gas",
        description: "foo foo",
        amount: 30,
    },
];
app.get("/", (_request, response) => {
    response.send("<h1>Hello World!</h1>");
});
app.get("/api/expenses", (_request, response) => {
    response.json(expenses);
});
/**
 * - Checks if req.body has valid newExpenseData
 * - return the data if valid,
 * - throws error otherwise
 * @param body
 * @returns
 */
const parseNewExpenseData = (body) => {
    if (!body || typeof body !== "object") {
        throw new Error();
    }
    if ("category" in body &&
        typeof body.category === "string" &&
        "description" in body &&
        typeof body.description === "string" &&
        "amount" in body &&
        typeof body.amount === "number") {
        const newExpenseData = {
            category: body.category,
            description: body.description,
            amount: body.amount,
        };
        return newExpenseData;
    }
    throw new Error();
};
app.post("/api/expenses/", (req, res) => {
    try {
        const newExpenseData = parseNewExpenseData(req.body);
        const currentDay = new Date(Date.now()).toString();
        const newExpense = {
            id: Math.random(),
            dateAdded: currentDay,
            category: newExpenseData.category,
            description: newExpenseData.description,
            amount: newExpenseData.amount,
        };
        expenses.push(newExpense);
        return res.status(201).json(newExpense);
    }
    catch (error) {
        return res
            .status(400)
            .send({ error: "Invalid Data. Could not create new expense" });
    }
});
app.use(unknownEndpoint);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
