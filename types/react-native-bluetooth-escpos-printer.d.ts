declare module "react-native-bluetooth-escpos-printer" {
  export const BluetoothManager: {
    enableBluetooth(): Promise<boolean>;
    scanDevices(): Promise<string>; // Include both paired and found devices
    connect(address: string): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): Promise<boolean>;
    isBluetoothEnabled(): Promise<boolean>;
    closeBluetooth(): Promise<void>; // Turns off Bluetooth
    unpairDevice(address: string): Promise<void>; // Unpair a device

    // Event names
    EVENT_DEVICE_ALREADY_PAIRED: string; // Emits the devices array already paired
    EVENT_DEVICE_DISCOVER_DONE: string; // Emits when the scan is done
    EVENT_DEVICE_FOUND: string; // Emits when device found during scan
    EVENT_CONNECTION_LOST: string; // Emits when device connection is lost
    EVENT_UNABLE_CONNECT: string; // Emits when error occurs while trying to connect device
    EVENT_CONNECTED: string; // Emits when device connected
    EVENT_BLUETOOTH_NOT_SUPPORT: string; // Emits when device does not support Bluetooth (Android only)
    EVENT_BLUETOOTH_DISABLED: string; // Emits when Bluetooth is disabled
  };

  export const BluetoothEscposPrinter: {
    printText(
      text: string,
      options: {
        encoding?: string; // 'GBK' or other encoding options
        codepage?: number; // Codepage as number, like 0 for default, CP437, etc.
        widthtimes?: number; // Width scaling (e.g., 1, 2, 3)
        heightimes?: number; // Height scaling (e.g., 1, 2, 3)
        fonttype?: number; // Font type (e.g., 0 for A, 1 for B)
      }
    ): Promise<void>;
    printImage(
      base64Image: string,
      options: { width: number; height: number; align: number }
    ): Promise<void>;
    printBarcode(
      barcode: string,
      options: {
        type: number;
        width: number;
        height: number;
        position: number;
        font: number;
      }
    ): Promise<void>;
    printQRCode(
      qrCode: string,
      options: {
        width: number;
        height: number;
        position: number;
      }
    ): Promise<void>;
    printerUnderLine(line: number): Promise<void>;
    printerInit(): Promise<void>; // Initialize printer
    printerAlign(align: number): Promise<void>; // Align text or image
    printerLeftSpace(space: number): Promise<void>; // Set left space
    printerCut(mode: number): Promise<void>; // Cut the paper
    printerLineSpace(sp: number): Promise<void>;
    // Status methods
    getPrinterStatus(): Promise<string>; // Get the printer status
    setPrinterStatusRetrievalInterval(interval: number): Promise<void>; // Set the interval to check the printer status
    printAndFeed(feed: number): Promise<void>; // Add this line
    printColumn(
      columnWidths: number[],
      columnAligns: number[],
      columnTexts: string[],
      options: {
        encoding?: string;
        codepage?: number;
        widthtimes?: number;
        heigthtimes?: number;
        fonttype?: number;
      }
    ): Promise<void>;
    // Alignment Constants
    ALIGN: {
      LEFT: number;
      CENTER: number;
      RIGHT: number;
    };
  };

  export const BluetoothTscPrinter: {
    printLabel(
      size: { width: number; height: number },
      commands: any[]
    ): Promise<void>;
    printText(
      text: string,
      x: number,
      y: number,
      font: string,
      rotation: number,
      xMultiplication: number,
      yMultiplication: number
    ): Promise<void>; // Print text with label commands
    printBarcode(
      barcode: string,
      x: number,
      y: number,
      type: string,
      height: number,
      readable: number,
      rotation: number,
      narrow: number,
      wide: number
    ): Promise<void>; // Print barcode for TSC printer
    printQRCode(
      qrCode: string,
      x: number,
      y: number,
      level: string,
      width: number,
      rotation: number
    ): Promise<void>; // Print QR code for TSC printer
    sendCommand(command: string): Promise<void>; // Send raw command to the TSC printer
  };
}
