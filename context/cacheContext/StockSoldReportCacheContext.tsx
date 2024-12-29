import { createContext, ReactNode, useContext, useState } from "react";
import { StockReportDataToExcel } from "../../types/type";

type StockSoldReportCacheContextType = {
  stockSoldCache: Map<string, StockReportDataToExcel[]>;
  setStockSoldCache: React.Dispatch<
    React.SetStateAction<Map<string, StockReportDataToExcel[]>>
  >;
};

const StockSoldReportCacheContext = createContext<
  StockSoldReportCacheContextType | undefined
>(undefined);

export const StockSoldReportCacheProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [stockSoldCache, setStockSoldCache] = useState<
    Map<string, StockReportDataToExcel[]>
  >(new Map());

  return (
    <StockSoldReportCacheContext.Provider
      value={{ stockSoldCache, setStockSoldCache }}
    >
      {children}
    </StockSoldReportCacheContext.Provider>
  );
};

export const useStockSoldReportCacheContext =
  (): StockSoldReportCacheContextType => {
    const context = useContext(StockSoldReportCacheContext);
    if (!context) {
      throw new Error(
        "StockSoldReportCacheContext must be used within a StockSoldReportCacheProvider"
      );
    }
    return context;
  };
