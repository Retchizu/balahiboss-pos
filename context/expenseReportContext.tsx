import { createContext, useState, useContext, ReactNode } from "react";
import { ExpenseReport } from "../type";

type ExpenseReportContextType = {
  expenseList: ExpenseReport[];
  addExpense: (newExpense: ExpenseReport) => void;
  updateExpense: (expenseId: String, attribute: Partial<ExpenseReport>) => void;
  setExpense: (newExpenseList: ExpenseReport[]) => void;
};

const ExpenseReportContext = createContext<
  ExpenseReportContextType | undefined
>(undefined);

export const ExpenseReportProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [expenseList, setExpenseList] = useState<ExpenseReport[]>([]);
  const addExpense = (newExpense: ExpenseReport) => {
    setExpenseList((prevExpenses) => [...prevExpenses, newExpense]);
  };
  const updateExpense = (
    expenseId: String,
    attribute: Partial<ExpenseReport>
  ) => {
    setExpenseList((prevExpense) =>
      prevExpense.map((expense) =>
        expense.id == expenseId ? { ...expense, attribute } : expense
      )
    );
  };
  const setExpense = (newExpenseList: ExpenseReport[]) => {
    setExpenseList(newExpenseList);
  };

  return (
    <ExpenseReportContext.Provider
      value={{ expenseList, addExpense, updateExpense, setExpense }}
    >
      {children}
    </ExpenseReportContext.Provider>
  );
};

export const useExpenseReportContext = (): ExpenseReportContextType => {
  const context = useContext(ExpenseReportContext);
  if (!context) {
    throw new Error(
      "useExpenseReportContext must be used within a ExpenseReportProvider"
    );
  }
  return context;
};
