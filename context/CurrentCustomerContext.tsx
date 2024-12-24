import { createContext, ReactNode, useContext, useState } from "react";
import { Customer } from "../types/type";

type CurrentCustomerContextType = {
  currentCustomer: Customer | null;
  setCurrentCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
  updateCurrentCustomer: (attribute: Partial<Customer>) => void;
};

const CurrentCustomerContext = createContext<
  CurrentCustomerContextType | undefined
>(undefined);

export const CurrentCustomerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

  const updateCurrentCustomer = (attribute: Partial<Customer>) => {
    setCurrentCustomer((prev) => ({ ...prev!, ...attribute }));
  };

  return (
    <CurrentCustomerContext.Provider
      value={{ currentCustomer, setCurrentCustomer, updateCurrentCustomer }}
    >
      {children}
    </CurrentCustomerContext.Provider>
  );
};

export const useCurrentCustomerContext = (): CurrentCustomerContextType => {
  const context = useContext(CurrentCustomerContext);
  if (!context) {
    throw new Error(
      "CurrentCustomerContext must be used within a CurrentCustomerProvider"
    );
  }
  return context;
};
