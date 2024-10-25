import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import React from "react";
import { Device, SelectedProduct } from "../types/type";
import Toast, { ToastType } from "react-native-toast-message";
import { Button } from "@rneui/base";
import { handlePrint } from "../methods/print-methods/handlePrint";
import { connectToBluetooth } from "../methods/print-methods/connectToBluetooth";
import AsyncStorage from "@react-native-async-storage/async-storage";

type BluetoothDeviceListModalProp = {
  isBluetoothDeviceListModalVisible: boolean;
  printButtonVisibility: boolean;
  setIsInvoiceModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setIsBluetoothDeviceListModalVisible: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  pairedDevices: Device[];
  selectedProducts: SelectedProduct[];
  deliveryFee: string;
  discount: string;
  invoiceDate: Date;
  currentPrinter: Device | undefined;
  setCurrentPrinter: React.Dispatch<React.SetStateAction<Device | undefined>>;
  setPrintButtonVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  showToast: (type: ToastType, text1: string, text2?: string) => void;
  setPairedDevice: React.Dispatch<React.SetStateAction<Device[]>>;
};

const BluetoothDeviceListModal = ({
  isBluetoothDeviceListModalVisible,
  setIsInvoiceModalVisible,
  setIsBluetoothDeviceListModalVisible,
  pairedDevices,
  selectedProducts,
  deliveryFee,
  discount,
  invoiceDate,
  showToast,
  printButtonVisibility,
  setCurrentPrinter,
  currentPrinter,
  setPairedDevice,
  setPrintButtonVisibility,
}: BluetoothDeviceListModalProp) => {
  return (
    <Modal
      visible={isBluetoothDeviceListModalVisible}
      transparent={true}
      onRequestClose={() => {
        setIsBluetoothDeviceListModalVisible(false);
        setIsInvoiceModalVisible(true);
      }}
    >
      <View style={styles.mainContainer}>
        <View style={styles.childContainer}>
          <Text style={styles.textTitle}>Paired Bluetooth Devices</Text>
          {pairedDevices && pairedDevices.length ? (
            <FlatList
              style={{ flex: 1 }}
              data={pairedDevices}
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <Text style={styles.deviceName}>{item.name}</Text>
                  <Button
                    title={"Set as printer"}
                    containerStyle={{ flex: 1 }}
                    buttonStyle={styles.buttonStyle}
                    titleStyle={styles.titleStyle}
                    onPress={() => {
                      setCurrentPrinter(item);
                      AsyncStorage.setItem("printer", JSON.stringify(item));
                    }}
                    loading={printButtonVisibility}
                  />
                </View>
              )}
            />
          ) : (
            <ActivityIndicator
              color={"#634F40"}
              size={wp(10)}
              style={{ flex: 1 }}
            />
          )}

          <View>
            <Text
              style={{
                textAlign: "center",
                fontFamily: "SoraSemiBold",
                fontSize: wp(5),
              }}
            >
              Current Printer
            </Text>
            <View style={styles.currentPrinterParent}>
              {currentPrinter ? (
                <View style={styles.currentPrinterChild}>
                  <Text style={styles.deviceName}>{currentPrinter.name}</Text>
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <Button
                      title={"Print"}
                      containerStyle={{ paddingHorizontal: wp(1) }}
                      buttonStyle={styles.buttonStyle}
                      titleStyle={styles.titleStyle}
                      onPress={() => {
                        handlePrint(
                          selectedProducts,
                          discount,
                          deliveryFee,
                          invoiceDate,
                          currentPrinter,
                          showToast
                        );
                      }}
                    />
                    <Button
                      title={"Remove printer"}
                      buttonStyle={styles.buttonStyle}
                      titleStyle={styles.titleStyle}
                      onPress={async () => {
                        setCurrentPrinter(undefined);
                        try {
                          await AsyncStorage.removeItem("printer");
                          if (pairedDevices.length === 0 && currentPrinter) {
                            const pairedDevice = await connectToBluetooth(
                              showToast,
                              setPrintButtonVisibility
                            );
                            setPairedDevice(pairedDevice);
                          }
                        } catch (error) {
                          console.error(
                            "Failed to connect to Bluetooth:",
                            error
                          );
                          showToast("error", "Failed to get paired devices");
                        }
                      }}
                    />
                  </View>
                </View>
              ) : (
                <Text style={styles.currentPrinterMessage}>
                  No current printer
                </Text>
              )}
            </View>
          </View>
        </View>
        <Toast position="bottom" autoHide visibilityTime={2000} />
      </View>
    </Modal>
  );
};

export default BluetoothDeviceListModal;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: wp(2),
    justifyContent: "center",
  },
  childContainer: {
    height: hp(75),
    backgroundColor: "#F3F0E9",
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderRadius: wp(1.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textTitle: {
    textAlign: "center",
    fontFamily: "SoraSemiBold",
    fontSize: wp(5),
  },
  itemContainer: {
    borderWidth: wp(0.3),
    borderColor: "#634F40",
    padding: wp(5),
    marginVertical: hp(0.5),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonStyle: {
    backgroundColor: "#E6B794",
    borderRadius: wp(1.5),
  },
  deviceName: {
    fontFamily: "SoraMedium",
    fontSize: wp(4),
    flex: 1,
  },
  titleStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(3),
  },
  currentPrinterChild: { flexDirection: "row", alignItems: "center" },
  currentPrinterParent: {
    borderWidth: wp(0.3),
    borderColor: "#634F40",
    padding: wp(5),
    marginVertical: hp(0.5),
  },
  currentPrinterMessage: {
    fontFamily: "SoraLight",
    fontSize: wp(4),
    textAlign: "center",
  },
});
