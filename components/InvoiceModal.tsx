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
import { SelectedProduct } from "../types/type";
import { calculatePrice } from "../methods/calculation-methods/calculatePrice";
import { calculateTotalPrice } from "../methods/calculation-methods/calculateTotalPrice";
import Entypo from "@expo/vector-icons/Entypo";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

type InvoiceFormProps = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<SetStateAction<boolean>>;
  selectedProducts: SelectedProduct[];
  deliveryFee: string;
};
const InvoiceModal = ({
  isVisible,
  setIsVisible,
  selectedProducts,
  deliveryFee,
}: InvoiceFormProps) => {
  const viewRef = useRef<View>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [snapshotVisible, setSnapshotVisible] = useState(true);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  if (permissionResponse === null) {
    requestPermission();
  }

  const captureAndHandle = async () => {
    try {
      setSnapshotVisible(false);
      // Capture the view;
      const localUri = await captureRef(viewRef, {
        format: "jpg",
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(localUri);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(localUri);
      }

      console.log("Success", "Image saved to gallery!");

      setSnapshotVisible(true);
    } catch (error) {
      console.error("Failed to capture and handle image:", error);
      setSnapshotVisible(true);
    }
  };
  return (
    <Modal
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
      transparent
    >
      <View style={styles.mainContainer}>
        <View style={styles.childContainer} ref={viewRef}>
          <Text style={styles.invoiceFormTitle}>BalahiBoss Pet Supplies</Text>
          <View style={styles.rowFormat}>
            <Text style={[styles.invoiceLabel, { flex: 2 }]}>Description</Text>
            <Text
              style={[styles.invoiceLabel, { flex: 1, textAlign: "center" }]}
            >
              Qty
            </Text>
            <Text style={[styles.invoiceLabel, { flex: 0.5 }]}>Price</Text>
          </View>
          <FlatList
            data={selectedProducts}
            renderItem={({ item }) => (
              <View style={styles.rowFormat}>
                <Text style={[styles.invoiceValue, { flex: 2 }]}>
                  {item.productName}
                </Text>
                <Text
                  style={[
                    styles.invoiceValue,
                    { flex: 1, textAlign: "center" },
                  ]}
                >
                  {item.quantity}
                </Text>
                <Text style={[styles.invoiceValue, { flex: 0.5 }]}>
                  ₱ {calculatePrice(item)}
                </Text>
              </View>
            )}
          />
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
            <Text style={styles.footerFontStyle}>Total</Text>
            <Text style={styles.footerFontStyle}>
              ₱ {calculateTotalPrice(selectedProducts, parseFloat(deliveryFee))}
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
            <TouchableOpacity
              style={{
                position: "absolute",
                bottom: wp(5),
                right: wp(5),
                alignSelf: "flex-end",
              }}
              activeOpacity={0.6}
              onPress={() => captureAndHandle()}
            >
              <Entypo name="camera" size={26} color="#634F40" />
            </TouchableOpacity>
          )}
        </View>
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
    fontSize: wp(4.5),
    fontFamily: "SoraSemiBold",
  },
  invoiceValue: {
    fontSize: wp(3.5),
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
  },
  footerFontStyle: {
    fontSize: wp(6),
    fontFamily: "SoraSemiBold",
  },
});
