import { DateYMString } from "../../types";

/**
 * private method for returning current year-month in YYYY-MM format
 * @returns
 */
const getCurrentMonthYear = (): DateYMString => {
  // // for creating Dates in previous months
  // const juneDate = new Date("2023-06-10");
  // const currentDate = juneDate;
  // --
  const currentDate: Date = new Date();
  const currentMonth = currentDate.getMonth() + 1; // To maake JAN 1 instead of 0
  const currentYear = currentDate.getFullYear();

  const currentMonthString =
    currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;

  return `${currentYear}-${currentMonthString}` as DateYMString;
};

export default {
  getCurrentMonthYear,
};
