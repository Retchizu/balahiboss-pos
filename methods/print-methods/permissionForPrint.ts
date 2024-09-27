import { PermissionsAndroid, Platform } from "react-native";
export const permissionForPrint = async () => {
  try {
    if ((Platform.Version as number) >= 31) {
      const grantedBluetoothConnect = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        {
          title: "Bluetooth Connect Permission",
          message: "This app needs access to connect to Bluetooth devices.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      const grantedBluetoothScan = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        {
          title: "Bluetooth Scan Permission",
          message: "This app needs access to scan for Bluetooth devices.",
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
        grantedBluetoothConnect === PermissionsAndroid.RESULTS.GRANTED &&
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
      const grantedBluetooth = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH,
        {
          title: "Bluetooth Permission",
          message: "This app requires Bluetooth access to connect to devices.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      const grantedBluetoothAdmin = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
        {
          title: "Bluetooth Admin Permission",
          message:
            "This app requires Bluetooth Admin access to manage Bluetooth settings.",
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
        grantedBluetooth === PermissionsAndroid.RESULTS.GRANTED &&
        grantedBluetoothAdmin === PermissionsAndroid.RESULTS.GRANTED &&
        grantedFineLocation == PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true;
      } else {
        console.log(
          "Bluetooth permissions denied for Android versions below 12"
        );
      }
    }
    return false;
  } catch (error) {
    console.log("error asking for permissions");
  }
};
