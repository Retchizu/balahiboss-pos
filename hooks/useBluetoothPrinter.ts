import { auth } from "@/config/firebaseConfig";
import calculateInvoiceTotalPrice from "@/methods/invoice/calculateInvoiceTotalPrice";
import calculateSubTotalPrice from "@/methods/invoice/calculateSubTotalPrice";
import InvoiceForm from "@/types/InvoiceForm";
import SelectedProduct from "@/types/SelectedProduct";
import {
    BluetoothManager,
    BluetoothEscposPrinter,
    Device,
} from "@brooons/react-native-bluetooth-escpos-printer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import Toast from "react-native-toast-message";

const useBluetoothPrinter = () => {
    const [foundDevices, setFoundDevices] = useState<Device[]>([]);
    const [pairedDevices, setPairedDevices] = useState<Device[]>([]);

    const isBluetoothEnabled = () => BluetoothManager.checkBluetoothEnabled();

    const isAlreadyConnected = async (): Promise<boolean> => {
        try {
            const address: any =
                await BluetoothManager.getConnectedDeviceAddress();
            return !!address;
        } catch (err) {
            console.log("No printer connected", err);
            return false;
        }
    };
    const scanDevices = async () => {
        const enabled = await isBluetoothEnabled();
        if (!enabled) {
            Toast.show({
                type: "error",
                text1: "Please enable Bluetooth to scan for devices.",
            });
            return;
        }

        const isPermissionGranted = await permissionForPrint();
        if (isPermissionGranted) {
            const scanDevices = await BluetoothManager.scanDevices();
            const scannedDevices: { found: Device[]; paired: Device[] } =
                JSON.parse(scanDevices);
            setFoundDevices(scannedDevices.found);
            setPairedDevices(scannedDevices.paired);
        }
    };

    const pairDevice = async (address: string) => {
        await BluetoothManager.connect(address);
        console.log("paired success");
    };

    const printReceipt = async (
        invoiceForm: InvoiceForm,
        selectedProducts: SelectedProduct[]
    ) => {
        try {
            // header
            const currentUser = auth.currentUser;
            console.log("printing");
            await BluetoothEscposPrinter.printerAlign(
                BluetoothEscposPrinter.ALIGN.CENTER
            );
            await BluetoothEscposPrinter.printText("BalahiBoss\r\n", {
                encoding: "UTF-8",
                fonttype: 3,
                heigthtimes: 2,
                widthtimes: 2,
            });

            await BluetoothEscposPrinter.printText("Pet Supplies\r\n", {
                encoding: "UTF-8",
                fonttype: 3,
                heigthtimes: 1,
                widthtimes: 1,
            });
            await BluetoothEscposPrinter.printerAlign(
                BluetoothEscposPrinter.ALIGN.LEFT
            );
            await BluetoothEscposPrinter.printText(
                `Date: ${
                    invoiceForm.date
                        ? invoiceForm.date.toLocaleString("en-PH", {
                              dateStyle: "medium",
                          })
                        : ""
                }\r\n`,
                {
                    encoding: "UTF-8",
                    fonttype: 1,
                    heigthtimes: 2,
                    widthtimes: 1,
                }
            );
            await BluetoothEscposPrinter.printText(
                `Time: ${
                    invoiceForm.date
                        ? invoiceForm.date
                              .toLocaleString("en-PH", {
                                  timeStyle: "short",
                                  hour12: true,
                              })
                              .replace(/\u202F/g, " ")
                        : ""
                }\r\n`,
                {
                    encoding: "UTF-8",
                    fonttype: 1,
                    heigthtimes: 2,
                    widthtimes: 1,
                }
            );

            await BluetoothEscposPrinter.printText(
                `Employee: ${currentUser?.displayName?.split(" ")[0]}\r\n`,
                {
                    encoding: "UTF-8",
                    fonttype: 1,
                    heigthtimes: 2,
                    widthtimes: 1,
                }
            );
            await BluetoothEscposPrinter.printText(
                "--------------------------------\r\n",
                {}
            );

            // items
            for (const item of selectedProducts) {
                const subtotal = `P ${calculateSubTotalPrice(item).toFixed(2)}`;

                // wrap product name to fit first column
                const wrappedName = wrapText(item.productName, 20); // adjust to your printer width

                // print each line of product name (only first line includes subtotal)
                for (let i = 0; i < wrappedName.length; i++) {
                    await BluetoothEscposPrinter.printColumn(
                        [22, 10],
                        [
                            BluetoothEscposPrinter.ALIGN.LEFT,
                            BluetoothEscposPrinter.ALIGN.RIGHT,
                        ],
                        [wrappedName[i], i === 0 ? subtotal : ""],
                        {}
                    );
                }

                // print qty × price under product
                await BluetoothEscposPrinter.printColumn(
                    [32],
                    [BluetoothEscposPrinter.ALIGN.LEFT],
                    [`${item.quantity} x P ${item.sellPrice.toFixed(2)}`],
                    {}
                );

                // spacing
                await BluetoothEscposPrinter.printText("\r\n", {});
            }
            await BluetoothEscposPrinter.printText(
                "--------------------------------\r\n",
                {}
            );
            await BluetoothEscposPrinter.printText(
                `# of items: ${totalQuantity(selectedProducts)}\r\n`,
                {}
            );
            await BluetoothEscposPrinter.printText(
                `TOTAL: P ${calculateInvoiceTotalPrice(
                    invoiceForm,
                    selectedProducts
                ).toFixed(2)}\r\n`,
                {
                    encoding: "UTF-8",
                    fonttype: 1,
                    heigthtimes: 2,
                    widthtimes: 2,
                }
            );
            console.log("done");
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Printer not found.",
            });
            console.log(error);
        }
    };

    const disconnectPrinter = async (address: string) => {
        await BluetoothManager.disconnect(address);
    };

    const pairSavedPrinter = async () => {
        try {
            const permission = await permissionForPrint();
            const savedCurrentPrinter = await AsyncStorage.getItem("printer");
            if (permission && savedCurrentPrinter) {
                const printer = JSON.parse(savedCurrentPrinter);
                await pairDevice(printer.address);
                console.log("Paired Successfully");
                return { success: true };
            }
            return { success: false };

        } catch (error) {
            console.error(error);
            Toast.show({ type: "error", text1: "Failed to pair printer." });
            return { success: false };
        }
    };

    return {
        foundDevices,
        pairedDevices,
        scanDevices,
        pairDevice,
        isBluetoothEnabled,
        printReceipt,
        isAlreadyConnected,
        disconnectPrinter,
        pairSavedPrinter,
    };
};

export default useBluetoothPrinter;

export const permissionForPrint = async () => {
    console.log((Platform.Version as number) >= 31);
    try {
        if ((Platform.Version as number) >= 31) {
            const grantedBluetoothConnect = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                {
                    title: "Bluetooth Connect Permission",
                    message:
                        "This app needs access to connect to Bluetooth devices.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK",
                }
            );

            const grantedBluetoothScan = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                {
                    title: "Bluetooth Scan Permission",
                    message:
                        "This app needs access to scan for Bluetooth devices.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK",
                }
            );

            const grantedFineLocation = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location Permission",
                    message:
                        "This app needs access to your location to scan Bluetooth devices.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK",
                }
            );

            if (
                grantedBluetoothConnect ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                grantedBluetoothScan === PermissionsAndroid.RESULTS.GRANTED &&
                grantedFineLocation === PermissionsAndroid.RESULTS.GRANTED
            ) {
                console.log("Bluetooth permissions granted for Android 12+");
                return true;
            } else {
                console.log("Bluetooth permissions denied for Android 12+");
                return false;
            }
        } else {
            // For Android versions below 12, only request general Bluetooth permissions
            const grantedFineLocation = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION ?? "",
                {
                    title: "Location Permission",
                    message:
                        "This app needs access to your location to scan Bluetooth devices.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK",
                }
            );

            if (grantedFineLocation === PermissionsAndroid.RESULTS.GRANTED) {
                console.log(
                    "Bluetooth permissions granted for Android versions below 12"
                );
                return true;
            } else {
                console.log(
                    "Bluetooth permissions denied for Android versions below 12"
                );
                return false;
            }
        }
    } catch (error) {
        console.log(error);
        console.log("error asking for permissions");
    }
};

//text wrapper in receipt printing

const wrapText = (text: string, maxChars: number): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];

    let currentLine = "";

    for (const word of words) {
        if ((currentLine + " " + word).trim().length > maxChars) {
            lines.push(currentLine.trim());
            currentLine = word;
        } else {
            currentLine += " " + word;
        }
    }
    if (currentLine) lines.push(currentLine.trim());

    return lines;
};

// calculate the total quantity of items
const totalQuantity = (selectedProducts: SelectedProduct[]) => {
    const total = selectedProducts.reduce(
        (sum, product) => sum + product.quantity,
        0
    );

    return total;
};
