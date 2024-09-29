import { BluetoothManager } from "react-native-bluetooth-escpos-printer";
import { ToastType } from "react-native-toast-message";
import { permissionForPrint } from "./permissionForPrint";

export const connectToBluetooth = async (
  showToast: (type: ToastType, text1: string, text2?: string) => void,
  setPrintButtonVisibility: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    setPrintButtonVisibility(true);
    const isBluetoothEnabled = await BluetoothManager.isBluetoothEnabled();
    if (!isBluetoothEnabled) {
      showToast("info", "Please turn on your bluetooth and location");
      return;
    }
    showToast("info", "Checking for permission");
    const isGranted = await permissionForPrint();
    if (isGranted) {
      showToast("info", "Connecting...", "Please wait");
      const devices = await BluetoothManager.scanDevices();
      const devicesJson = JSON.parse(devices);
      showToast("info", "Make sure the device is a thermal printer");
      setPrintButtonVisibility(false);

      return devicesJson.paired;
    }
    return [];
  } catch (error) {
    showToast("error", "Turn on your bluetooth and location");
    setPrintButtonVisibility(false);
  }
};
