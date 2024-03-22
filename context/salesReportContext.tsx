import { createContext, useContext, useState, ReactNode } from "react";
import { PosReport } from "../type";

type SalesReportContextType = {
  salesReports: PosReport[];
  addSalesReport: (newReport: PosReport) => void;
  updateSalesReport: (reportId: String, attribute: Partial<PosReport>) => void;
  setSalesReportList: (newReportList: PosReport[]) => void;
};

const SalesReportContext = createContext<SalesReportContextType | undefined>(
  undefined
);

export const SalesReportProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [salesReports, setSalesReports] = useState<PosReport[]>([]);

  const addSalesReport = (newReport: PosReport) => {
    setSalesReports((prevSalesReport) => [...prevSalesReport, newReport]);
  };

  const updateSalesReport = (
    reportId: String,
    attribute: Partial<PosReport>
  ) => {
    setSalesReports((prevSalesReport) =>
      prevSalesReport.map((report) =>
        report.id === reportId ? { ...report, attribute } : report
      )
    );
  };

  const setSalesReportList = (newReportList: PosReport[]) => {
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
