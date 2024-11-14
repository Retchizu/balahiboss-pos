import { ToastType } from "react-native-toast-message";
import { Product } from "../../types/type";
import { calculateTotalStockAmount } from "../calculation-methods/calculateTotalStockAmount";
import * as XLXS from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export const productStockReportToExcel = async (
  products: Product[],
  fileName: string,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  if (fileName.trim()) {
    try {
      const dataToExcel = products.map((product) => {
        const rowData: { [key: string]: string | number } = {
          Product_Name: product.productName,
          Stock: product.stock,
          Stock_Price: product.stockPrice,
          Sell_Price: product.sellPrice,
          Current_Stock_Total_Amount: calculateTotalStockAmount(product),
        };

        return rowData;
      });
      const worksheet = XLXS.utils.json_to_sheet(dataToExcel);
      worksheet["!cols"] = [
        { wch: 40 },
        { wch: 6 },
        { wch: 12 },
        { wch: 11 },
        { wch: 28 },
      ];

      const workbook = XLXS.utils.book_new();
      XLXS.utils.book_append_sheet(workbook, worksheet, "Product Data");

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
          dialogTitle: "Share Product Report Excel File",
        });
      }
    } catch (error) {
      showToast("error", "Something went wrong", "Try again later");
      console.log(error);
    }
  } else {
    showToast("error", "Please add a file name");
  }
};
