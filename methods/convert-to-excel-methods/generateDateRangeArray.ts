import { readableDate } from "../time-methods/readableDate";

export const generateDateRangeArray = (
  startDate: Date | null,
  endDate: Date | null
) => {
  startDate ??= new Date();
  endDate ??= new Date();

  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
