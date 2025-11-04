import { User } from "@/types/User";
import { createContext, useContext, useState, ReactNode } from "react";


type SelectedEmployeeContextType = {
  selectedEmployee: User | null;
  setSelectedEmployee: (employee: User | null) => void;
};

const SelectedEmployeeContext = createContext<SelectedEmployeeContextType | undefined>(undefined);

export const useSelectedEmployeeContext = () => {
  const context = useContext(SelectedEmployeeContext);
  if (!context) {
    throw new Error("useSelectedEmployee must be used within a SelectedEmployeeProvider");
  }
  return context;
};

type ProviderProps = {
  children: ReactNode;
};

export const SelectedEmployeeProvider = ({ children }: ProviderProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  return (
    <SelectedEmployeeContext.Provider value={{ selectedEmployee, setSelectedEmployee }}>
      {children}
    </SelectedEmployeeContext.Provider>
  );
};
