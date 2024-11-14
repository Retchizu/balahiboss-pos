import { useEffect } from "react";
import { useSalesReportContext } from "../../context/SalesReportContext";
import { getSalesReportData } from "../../methods/data-methods/getSalesReportData";
import { ToastType } from "react-native-toast-message";
import { User } from "../../types/type";

export const useGetSalesReport = (
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  user: User | null
) => {
  const { salesReports, setSalesReportList } = useSalesReportContext();

  useEffect(() => {
    if (salesReports.length === 0)
      getSalesReportData(
        new Date(),
        new Date(),
        setSalesReportList,
        setIsLoading,
        showToast,
        user
      );
  }, []);

  return {
    salesReports,
    setSalesReportList,
  };
};
