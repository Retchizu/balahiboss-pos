import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToastContext } from "../../context/ToastContext";
import { Device } from "../../types/type";

export const useBluetoothPrinter = () => {
  const [pairedDevices, setPairedDevices] = useState<Device[]>([]);
  const [currentPrinter, setCurrentPrinter] = useState<Device>();
  const { showToast } = useToastContext();

  useEffect(() => {
    const loadPrinter = async () => {
      try {
        const printerData = await AsyncStorage.getItem("printer");
        if (printerData !== null) {
          setCurrentPrinter(JSON.parse(printerData));
        }
      } catch (error) {
        showToast(
          "error",
          "Select a new printer",
          "Error loading previous printer"
        );
      }
    };

    loadPrinter();
  }, []);

  return {
    pairedDevices,
    setPairedDevices,
    currentPrinter,
    setCurrentPrinter,
  };
};
