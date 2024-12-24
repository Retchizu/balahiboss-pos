import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { SetStateAction, useRef, useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Device, SelectedProduct } from "../types/type";
import { calculatePrice } from "../methods/calculation-methods/calculatePrice";
import { calculateTotalPrice } from "../methods/calculation-methods/calculateTotalPrice";
import Entypo from "@expo/vector-icons/Entypo";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import Toast, { ToastType } from "react-native-toast-message";
import { connectToBluetooth } from "../methods/print-methods/connectToBluetooth";

type InvoiceFormProps = {
  isInvoiceVisible: boolean;
  setIsBluetoothDeviceListModalVisible: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  setIsInvoiceVisible: React.Dispatch<SetStateAction<boolean>>;
  selectedProducts: Map<string, SelectedProduct>;
  deliveryFee: string;
  discount: string;
  showToast: (type: ToastType, text1: string, text2?: string) => void;
  setPairedDevice: React.Dispatch<React.SetStateAction<Device[]>>;
  setPrintButtonVisibility: React.Dispatch<React.SetStateAction<boolean>>;
};
const InvoiceModal = ({
  isInvoiceVisible,
  setIsInvoiceVisible,
  setIsBluetoothDeviceListModalVisible,
  selectedProducts,
  deliveryFee,
  discount,
  setPairedDevice,
  setPrintButtonVisibility,
  showToast,
}: InvoiceFormProps) => {
  const viewRef = useRef<View>(null);
  const [snapshotVisible, setSnapshotVisible] = useState(true);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  if (permissionResponse === null) {
    requestPermission();
  }

  const captureAndHandle = async () => {
    try {
      setSnapshotVisible(false);
      const localUri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
        height: 4080,
        width: 2080,
      });

      await MediaLibrary.saveToLibraryAsync(localUri);

      showToast("success", "Image saved to gallery!");

      setSnapshotVisible(true);
    } catch (error) {
      showToast("error", "Error saving to gallery", "try again later");
      console.error("Failed to capture and handle image:", error);
      setSnapshotVisible(true);
    }
  };
  return (
    <Modal
      visible={isInvoiceVisible}
      onRequestClose={() => setIsInvoiceVisible(false)}
      transparent
    >
      <View style={styles.mainContainer}>
        <View style={styles.childContainer} ref={viewRef}>
          <Text style={styles.invoiceFormTitle}>BalahiBoss Pet Supplies</Text>
          <View style={styles.rowFormat}>
            <Text style={[styles.invoiceLabel, { flex: 2 }]}>Description</Text>
            <Text
              style={[styles.invoiceLabel, { flex: 1.5, textAlign: "center" }]}
            >
              Qty
            </Text>
            <Text
              style={[styles.invoiceLabel, { flex: 1.5, textAlign: "center" }]}
            >
              Price
            </Text>
          </View>
          <FlatList
            data={Array.from(selectedProducts.values())}
            renderItem={({ item }) => (
              <View style={styles.rowFormat}>
                <Text style={[styles.invoiceValue, { flex: 2 }]}>
                  {item.productName}
                </Text>
                <Text
                  style={[
                    styles.invoiceValue,
                    { flex: 2, textAlign: "center" },
                  ]}
                >
                  {item.quantity}
                </Text>
                <Text
                  style={[
                    styles.invoiceValue,
                    { flex: 1.5, textAlign: "center" },
                  ]}
                >
                  ₱ {calculatePrice(item).toFixed(2)}
                </Text>
              </View>
            )}
          />
          {discount.trim() && (
            <View style={styles.footerStyle}>
              <Text
                style={[styles.invoiceValue, { flex: 2.5, fontSize: wp(4) }]}
              >
                Discount
              </Text>
              <Text
                style={[
                  styles.invoiceValue,
                  { flex: 0.5, textAlign: "center", fontSize: wp(4) },
                ]}
              >
                ₱ {discount}
              </Text>
            </View>
          )}
          {deliveryFee.trim() && (
            <View style={styles.footerStyle}>
              <Text
                style={[styles.invoiceValue, { flex: 2.5, fontSize: wp(4) }]}
              >
                Delivery Fee
              </Text>
              <Text
                style={[
                  styles.invoiceValue,
                  { flex: 0.5, textAlign: "center", fontSize: wp(4) },
                ]}
              >
                ₱ {deliveryFee}
              </Text>
            </View>
          )}
          <View style={styles.footerStyle}>
            <Text style={styles.footerFontStyle}>TOTAL</Text>
            <Text style={styles.footerFontStyle}>
              ₱{" "}
              {calculateTotalPrice(
                selectedProducts,
                parseFloat(deliveryFee),
                parseFloat(discount)
              ).toFixed(2)}
            </Text>
          </View>

          <Text
            style={[
              styles.footerFontStyle,
              { textAlign: "center", marginVertical: hp(1) },
            ]}
          >
            THANK YOU!
          </Text>
          {snapshotVisible && (
            <View style={styles.buttonViewStyle}>
              <TouchableOpacity
                style={{ paddingHorizontal: wp(4) }}
                activeOpacity={0.6}
                onPress={() => captureAndHandle()}
              >
                <Entypo name="camera" size={26} color="#634F40" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={async () => {
                  setIsBluetoothDeviceListModalVisible(true);
                  setIsInvoiceVisible(false);
                  try {
                    const pairedDevice = await connectToBluetooth(
                      showToast,
                      setPrintButtonVisibility
                    );
                    setPairedDevice(pairedDevice);
                  } catch (error) {
                    console.error("Failed to connect to Bluetooth:", error);
                    showToast("error", "Failed to get paired devices");
                  }
                }}
              >
                <Entypo name="print" size={26} color="#634F40" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Toast position="bottom" autoHide visibilityTime={2000} />
      </View>
    </Modal>
  );
};

export default InvoiceModal;

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
  invoiceFormTitle: {
    fontSize: wp(6),
    fontFamily: "SoraSemiBold",
    textAlign: "center",
  },
  invoiceLabel: {
    fontSize: wp(5),
    fontFamily: "SoraSemiBold",
  },
  invoiceValue: {
    fontSize: wp(3),
    fontFamily: "SoraMedium",
  },
  rowFormat: {
    flexDirection: "row",
    paddingTop: hp(1.5),
    alignItems: "center",
  },
  footerStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: hp(1),
  },
  footerFontStyle: {
    fontSize: wp(6),
    fontFamily: "SoraSemiBold",
  },
  buttonViewStyle: {
    flexDirection: "row",
    position: "absolute",
    bottom: wp(5),
    right: wp(5),
  },
});
