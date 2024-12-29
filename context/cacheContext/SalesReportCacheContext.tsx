import { createContext, ReactNode, useContext, useState } from "react";
import { SalesReportDataToExcel } from "../../types/type";

type SalesReportCacheContextType = {
  salesReportCache: Map<string, SalesReportDataToExcel[]>;
  setSalesReportCache: React.Dispatch<
    React.SetStateAction<Map<string, SalesReportDataToExcel[]>>
  >;
};

const SalesReportCacheContext = createContext<
  SalesReportCacheContextType | undefined
>(undefined);

export const SalesReportCacheProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [salesReportCache, setSalesReportCache] = useState<
    Map<string, SalesReportDataToExcel[]>
  >(new Map());

  return (
    <SalesReportCacheContext.Provider
      value={{ salesReportCache, setSalesReportCache }}
    >
      {children}
    </SalesReportCacheContext.Provider>
  );
};

export const useSalesreportCacheContext = (): SalesReportCacheContextType => {
  const context = useContext(SalesReportCacheContext);
  if (!context) {
    throw new Error(
      "SalesReportCacheContext must be used within the SalesReportCacheProvider"
    );
  }

  return context;
};
