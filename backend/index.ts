import express, { Request, Response } from "express";

const app = express();

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

app.get("/", (_request: Request, response: Response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/expenses", (_request: Request, response: Response) => {
  response.json(expenses);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
