import axios from "axios";

import { CreateNewExpenseData } from "../../types";

const BASE_URL = "/api/expenses";

const getAll = () => {
  return axios.get(BASE_URL);
};

const create = (newExpense: CreateNewExpenseData) => {
  return axios.post(BASE_URL, newExpense);
};

export default {
  getAll: getAll,
  create: create,
};
