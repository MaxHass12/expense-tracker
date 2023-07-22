import axios from "axios";

import { NewExpense } from "../../types";

const BASE_URL = "/api/expenses";

const getAll = () => {
  return axios.get(BASE_URL);
};

const create = (newExpense: NewExpense) => {
  return axios.post(BASE_URL, newExpense);
};

export default {
  getAll: getAll,
  create: create,
};
