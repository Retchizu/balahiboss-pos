import { createContext, useContext, useState, ReactNode } from "react";
import { SalesReport } from "../types/type";

type SalesReportContextType = {
  salesReports: SalesReport[];
  addSalesReport: (newReport: SalesReport) => void;
  updateSalesReport: (
    reportId: String,
    attribute: Partial<SalesReport>
  ) => void;
  setSalesReportList: (newReportList: SalesReport[]) => void;
};

const SalesReportContext = createContext<SalesReportContextType | undefined>(
  undefined
);

export const SalesReportProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [salesReports, setSalesReports] = useState<SalesReport[]>([]);

  const addSalesReport = (newReport: SalesReport) => {
    setSalesReports((prevSalesReport) => [...prevSalesReport, newReport]);
  };

  const updateSalesReport = (
    reportId: String,
    attribute: Partial<SalesReport>
  ) => {
    setSalesReports((prevSalesReport) =>
      prevSalesReport.map((report) =>
        report.id === reportId ? { ...report, ...attribute } : report
      )
    );
  };

  const setSalesReportList = (newReportList: SalesReport[]) => {
    setSalesReports(newReportList);
  };

  return (
    <SalesReportContext.Provider
      value={{
        salesReports,
        addSalesReport,
        updateSalesReport,
        setSalesReportList,
      }}
    >
      {children}
    </SalesReportContext.Provider>
  );
};

export const useSalesReportContext = (): SalesReportContextType => {
  const context = useContext(SalesReportContext);
  if (!context) {
    throw new Error(
      "useSalesReportContext must be used within a SalesReportProvider"
    );
  }
  return context;
};
