import * as XLXS from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { generateDateRangeArray } from "./generateDateRangeArray";
import { SalesReport } from "../../types/type";
import { ToastType } from "react-native-toast-message";
import { calculateTotalPrice } from "../calculation-methods/calculateTotalPrice";
import { format } from "date-fns";
import { calculateDailyTotalAmount } from "../calculation-methods/calculateDailyTotalAmount";

export const salesReportsToExcel = async (
  salesReports: SalesReport[],
  startDate: Date | null,
  endDate: Date | null,
  fileName: string,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (fileName.trim()) {
    try {
      setLoading(true);
      const dates = generateDateRangeArray(startDate, endDate);
      const dataToExcel: {
        Customer_Name: string | undefined;
        Amount_Sold: number;
        Date_Bought: string;
      }[] = [];
      dates.forEach((date) => {
        const salesReportThisDate = salesReports.map((report) => ({
          Customer_Name: report.invoiceForm.customer?.customerName,
          Amount_Sold: calculateDailyTotalAmount(date, salesReports),
          Date_Bought: format(date, "MM/dd/yyyy"),
        }));
        dataToExcel.push(...salesReportThisDate);
      });

      const worksheet = XLXS.utils.json_to_sheet(dataToExcel);
      worksheet["!cols"] = [{ wch: 40 }, { wch: 14 }, { wch: 12 }];

      const workbook = XLXS.utils.book_new();
      XLXS.utils.book_append_sheet(workbook, worksheet, "Sales Data");

      const workbookOutput = XLXS.write(workbook, {
        type: "base64",
        bookType: "xlsx",
      });
      const fileUri = `${FileSystem.documentDirectory}${fileName}.xlsx`;

      await FileSystem.writeAsStringAsync(fileUri, workbookOutput, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Share Sales Report Excel File",
        });
      }
    } catch (error) {
      showToast("error", "Something went wrong", "Try again later");
      console.log(error);
    } finally {
      setLoading(false);
    }
  } else {
    showToast("info", "Please provide a file name");
  }
};
