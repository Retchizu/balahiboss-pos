import {
  choiceType,
  Product,
  SalesReport,
  StockReportDataToExcel,
} from "../../types/type";
import * as XLXS from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { ToastType } from "react-native-toast-message";
import { generateDateRangeArray } from "./generateDateRangeArray";
import { format } from "date-fns";
import { calculateDailyStockSold } from "../calculation-methods/calculateDailyStockSold";
import React from "react";
import { readableDate } from "../time-methods/readableDate";

export const stockSoldReportToExcel = async (
  products: Product[],
  salesReports: SalesReport[],
  startDate: Date | null,
  endDate: Date | null,
  fileName: string,
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setFileModalVisibility: React.Dispatch<React.SetStateAction<boolean>>,
  setIsConversionOptionsVisible: React.Dispatch<React.SetStateAction<boolean>>,
  setChoiceSelected: React.Dispatch<React.SetStateAction<choiceType | null>>,
  stockSoldCache: Map<string, StockReportDataToExcel[]>,
  setStockSoldCache: React.Dispatch<
    React.SetStateAction<Map<string, StockReportDataToExcel[]>>
  >
) => {
  if (fileName.trim()) {
    try {
      const dates = generateDateRangeArray(startDate, endDate);
      const dataToExcel: {
        Product_Name: string;
        Total_Stock_Sold: number;
        Date: string;
      }[] = [];
      dates.forEach((date) => {
        const currentDate = readableDate(date);
        if (stockSoldCache.has(currentDate)) {
          dataToExcel.push(...stockSoldCache.get(currentDate)!);
        } else {
          const stockSoldThisDate = products.map((product) => ({
            Product_Name: product.productName,
            Total_Stock_Sold: calculateDailyStockSold(
              date,
              salesReports,
              product.id
            ),
            Date: format(date, "MM/dd/yyyy"),
          }));

          dataToExcel.push(...stockSoldThisDate);
          setStockSoldCache((prevMap) => {
            const currentMap = new Map(prevMap);
            currentMap.set(currentDate, stockSoldThisDate);
            return currentMap;
          });
        }
      });

      const fileUri = await generateExcelFile(dataToExcel, fileName);
      await shareExcelFile(fileUri, showToast);
    } catch (error) {
      showToast("error", "Something went wrong", "Try again later");
      console.log(error);
    } finally {
      setLoading(false);
      setFileModalVisibility(false);
      setIsConversionOptionsVisible(false);
      setChoiceSelected(null);
    }
  } else {
    showToast("info", "Please provide a file name");
    setLoading(false);
  }
};

const shareExcelFile = async (fileUri: string, showToast: Function) => {
  if (await Sharing.isAvailableAsync()) {
    try {
      await Sharing.shareAsync(fileUri, {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Share Stock Report Excel File",
      });
    } catch {
      showToast("error", "Unable to share file", "Please try again.");
    }
  } else {
    showToast("info", "Sharing not available on this device");
  }
};

const generateExcelFile = async (
  dataToExcel: {
    Product_Name: string;
    Total_Stock_Sold: number;
    Date: string;
  }[],
  fileName: string
) => {
  const worksheet = XLXS.utils.json_to_sheet(dataToExcel);
  worksheet["!cols"] = [{ wch: 40 }, { wch: 17 }, { wch: 12 }];

  const workbook = XLXS.utils.book_new();
  XLXS.utils.book_append_sheet(workbook, worksheet, "Stock Sold Data");

  const workbookOutput = XLXS.write(workbook, {
    type: "base64",
    bookType: "xlsx",
  });
  const fileUri = `${FileSystem.documentDirectory}${fileName}.xlsx`;

  await FileSystem.writeAsStringAsync(fileUri, workbookOutput, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
};
