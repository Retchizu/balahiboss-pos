import {
  BluetoothManager,
  BluetoothEscposPrinter,
  BluetoothTscPrinter,
} from "react-native-bluetooth-escpos-printer";
import { SelectedProduct } from "../../types/type";
import { permissionForPrint } from "./permissionForPrint";
import { calculatePrice } from "../calculation-methods/calculatePrice";
import { calculateTotalPrice } from "../calculation-methods/calculateTotalPrice";
import { ToastType } from "react-native-toast-message";
import { readableDate } from "../time-methods/readableDate";
import {
  readableTime,
  readableTimeForReceipt,
} from "../time-methods/readableTime";

export const handlePrint = async (
  selectedProducts: SelectedProduct[],
  discount: string,
  deliveryFee: string,
  invoiceDate: Date,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    const isBluetoothEnabled = await BluetoothManager.isBluetoothEnabled();
    if (!isBluetoothEnabled) {
      showToast("info", "Please turn on your bluetooth and location");
      return;
    }
    showToast("info", "Checking for permission");
    const isGranted = await permissionForPrint();
    const wordWrap = (str: string, max: number, br: string = "\n"): string => {
      return str.replace(
        new RegExp(`(?![^\\n]{1,${max}}$)([^\\n]{1,${max}})\\s`, "g"),
        `$1${br}`
      );
    };
    if (isGranted) {
      showToast("info", "Connecting...", "Please wait");
      const devices = await BluetoothManager.scanDevices();
      const devicesJson = JSON.parse(devices);
      const printerDevice = devicesJson.paired.find(
        (device: { address: string; name: string }) =>
          device.name.includes("PT-210")
      );
      showToast("success", "Connected", "Printing Receipt");
      await BluetoothManager.connect(printerDevice.address);
      await BluetoothEscposPrinter.printerInit();
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER
      );

      const printTasks: Promise<void>[] = [];
      printTasks.push(
        BluetoothEscposPrinter.printText(
          "BalahiBoss\n" + "Pet\n" + "Supplies\n",
          {
            encoding: "UTF-8",
            fonttype: 3,
            widthtimes: 2,
            heightimes: 5,
          }
        )
      );

      if (invoiceDate) {
        printTasks.push(
          BluetoothEscposPrinter.printText(
            `Date Issued: ${readableDate(invoiceDate)}\n`,
            {}
          ),
          BluetoothEscposPrinter.printText(
            `Time Issued: ${readableTimeForReceipt(invoiceDate)}\n`,
            { encoding: "UTF-8" }
          )
        );
      }

      printTasks.push(
        BluetoothEscposPrinter.printText(
          "════════════════════════════════\n",
          {}
        ),
        BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT),
        BluetoothEscposPrinter.printColumn(
          [18, 5, 10],
          [0, 1, 2],
          ["Description", "Qty", "Price"],
          {
            encoding: "UTF-8",
          }
        )
      );

      selectedProducts.forEach((item) => {
        const wrappedProductName = wordWrap(item.productName, 13).split("\n");

        wrappedProductName.forEach((line, index) => {
          const quantity = index === 0 ? item.quantity.toString() : "";
          const price =
            index === 0 ? `P ${calculatePrice(item).toFixed(2)}` : "";

          printTasks.push(
            BluetoothEscposPrinter.printColumn(
              [18, 5, 10], // Column widths
              [0, 1, 2], // Column alignments (left, center, right)
              [
                line, // Wrapped product name (current line)
                quantity, // Quantity only on first line
                price, // Price only on first line
              ],
              { encoding: "UTF-8" }
            )
          );
        });
      });
      printTasks.push(
        BluetoothEscposPrinter.printColumn(
          [23, 10],
          [0, 2],
          ["Discount", `P ${discount.trim() ? discount : "0"}`],
          { encoding: "UTF-8" }
        )
      );

      printTasks.push(
        BluetoothEscposPrinter.printColumn(
          [23, 10],
          [0, 2],
          ["Delivery Fee", `P ${deliveryFee.trim() ? deliveryFee : "0"}`],
          { encoding: "UTF-8" }
        )
      );

      printTasks.push(
        BluetoothEscposPrinter.printColumn(
          [23, 10],
          [0, 2],
          [
            "TOTAL",
            `P ${calculateTotalPrice(
              selectedProducts,
              deliveryFee.trim() ? parseFloat(deliveryFee) : undefined,
              discount.trim() ? parseFloat(discount) : undefined
            ).toFixed(2)}`,
          ],
          { encoding: "UTF-8" }
        )
      );

      await Promise.all(printTasks);

      showToast(
        "success",
        "Printed Successfully",
        "Do not forget to confirm the invoice"
      );
    } else {
      showToast(
        "error",
        "Permission not granted",
        "Turn on your bluetooth and location"
      );
      return;
    }
  } catch (error) {
    showToast("error", "Turn on your bluetooth and location");
    console.log((error as Error).message);
  }
};
