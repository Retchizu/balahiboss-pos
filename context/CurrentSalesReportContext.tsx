import { createContext, ReactNode, useContext, useState } from "react";
import { CustomerReportParams } from "../types/type";

type CurrentSalesReportContextType = {
  currentSalesReport:
    | (CustomerReportParams & {
        fromSales: boolean;
      })
    | null;
  setCurrentSalesReport: React.Dispatch<
    React.SetStateAction<
      | (CustomerReportParams & {
          fromSales: boolean;
        })
      | null
    >
  >;
  updateCurrentSalesReport: (
    attribute: Partial<CustomerReportParams & { fromSales: boolean }>
  ) => void;
};

const CurrentSalesReportContext = createContext<
  CurrentSalesReportContextType | undefined
>(undefined);

export const CurrentSalesReportProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentSalesReport, setCurrentSalesReport] = useState<
    (CustomerReportParams & { fromSales: boolean }) | null
  >(null);

  const updateCurrentSalesReport = (
    attribute: Partial<CustomerReportParams & { fromSales: boolean }>
  ) => {
    setCurrentSalesReport((prev) => ({ ...prev!, ...attribute }));
  };

  return (
    <CurrentSalesReportContext.Provider
      value={{
        currentSalesReport,
        setCurrentSalesReport,
        updateCurrentSalesReport,
      }}
    >
      {children}
    </CurrentSalesReportContext.Provider>
  );
};

export const useCurrentSalesReportContext =
  (): CurrentSalesReportContextType => {
    const context = useContext(CurrentSalesReportContext);
    if (!context) {
      throw new Error(
        "CurrentSalesReportContext must be used within a CurrentSalesReportProvider"
      );
    }
    return context;
  };
