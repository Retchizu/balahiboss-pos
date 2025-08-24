import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { useRef, useState } from "react";
import { primary, strongPrimary } from "@/theme/backgroundTheme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useInvoiceFormContext } from "@/contexts/InvoiceFormContext";
import { useSelectedProductContext } from "@/contexts/SelectedProductContext";
import { useSelectedProductsArray } from "@/hooks/useSelectedProductsArray";
import calculateSubTotalPrice from "@/methods/invoice/calculateSubTotalPrice";
import calculateInvoiceTotalPrice from "@/methods/invoice/calculateInvoiceTotalPrice";
import CommonButton from "@/components/buttons/CommonButton";
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";

const EditInvoicePreviewScreen = () => {
  const { invoiceForm } = useInvoiceFormContext();
  const { selectedProducts } = useSelectedProductContext();
  const { selectedProductArray } = useSelectedProductsArray(selectedProducts);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [isButtonsVisible, setIsButtonsVisible] = useState(true);

  if (status === null) {
    requestPermission();
  }

  // view to capture
  const imageRef = useRef<View>(null);

  const captureAndHandle = async () => {
    try {
      setIsButtonsVisible(false);
      const localUri = await captureRef(imageRef, {
        format: "png",
        quality: 1,
        height: 4080,
        width: 2080,
      });

      await MediaLibrary.saveToLibraryAsync(localUri);

      console.log("success", "Image saved to gallery!");
    } catch (error) {
      console.log("error", "Error saving to gallery", "try again later");
      console.error("Failed to capture and handle image:", error);
    } finally {
      setIsButtonsVisible(true);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(5),
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          flex: 1,
          padding: wp(4),
          borderRadius: wp(4),
          shadowColor: strongPrimary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          marginBottom:hp(2)
        }}
        collapsable={false}
        ref={imageRef}
      >
        <Text
          style={{
            textAlign: "center",
            fontFamily: "Gantari-Bold",
            fontSize: wp(5),
          }}
        >
          BalahiBoss Pet Supplies
        </Text>

        <Text
          style={{
            fontFamily: "Gantari-SemiBold",
            fontSize: wp(3.5),
            textAlign: "center",
            marginTop: hp(2),
          }}
        >
          PAYMENT DETAILS
        </Text>
        <View
          style={{
            gap: hp(0.5),
            borderBottomWidth: wp(0.3),
            borderStyle: "dashed",
            borderColor: "black",
            paddingBottom: hp(1),
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          ></View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.paymentDetailsLabel}>Date and Time</Text>
            <Text style={styles.paymentDetailsValue}>
              {invoiceForm.date
                ?.toLocaleString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
                .replace(",", "")
                .replace(/AM|PM/, (m) => m.toLowerCase())}
            </Text>
          </View>
        </View>
        <FlatList
          data={selectedProductArray}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: hp(0.5),
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentDetailsLabel}>
                  {item.productName}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <Text style={[styles.paymentDetailsValue, { color: "#ff6347", fontFamily:"Gantari-SemiBold" }]}>
                    {item.quantity}{" "}
                  </Text>
                  <Text style={styles.paymentDetailsValue}>
                    x ₱ {item.sellPrice.toFixed(2)}
                  </Text>
                </View>
              </View>
              <Text
                style={[styles.paymentDetailsValue, { textAlign: "right" }]}
              >
                ₱ {calculateSubTotalPrice(item).toFixed(2)}
              </Text>
            </View>
          )}
          style={{
            marginTop: hp(1),
            marginBottom: hp(2),
            borderBottomWidth: wp(0.2),
            borderStyle: "dashed",
            borderColor: "black",
          }}
        />
        {invoiceForm.deliveryFee && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.paymentDetailsLabel}>Delivery Fee</Text>
            <Text style={styles.paymentDetailsValue}>
              ₱ {parseFloat(invoiceForm.deliveryFee).toFixed(2)}
            </Text>
          </View>
        )}
        {invoiceForm.discount && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.paymentDetailsLabel}>Discount</Text>
            <Text style={styles.paymentDetailsValue}>
              ₱ {parseFloat(invoiceForm.discount).toFixed(2)}
            </Text>
          </View>
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: hp(2),
          }}
        >
          <Text style={{ fontFamily: "Gantari-Bold", fontSize: wp(6) }}>
            AMOUNT
          </Text>
          <Text style={{ fontFamily: "Gantari-Bold", fontSize: wp(6) }}>
            ₱{" "}
            {calculateInvoiceTotalPrice(
              invoiceForm,
              selectedProductArray
            ).toFixed(2)}
          </Text>
        </View>
      </View>
      {isButtonsVisible && (
        <View style={{ flexDirection: "row", gap: wp(2) }}>
          <CommonButton
            title="Save to Gallery"
            onPress={() => captureAndHandle()}
            backgroundColor={primary}
            iconLeft={{
              family: "Entypo",
              name: "camera",
              color: "black",
              size: wp(6),
            }}
          />
          <CommonButton
            title="Print Invoice"
            onPress={() => {}}
            backgroundColor={strongPrimary}
            titleColor={"white"}
            iconLeft={{
              family: "Entypo",
              name: "print",
              color: "white",
              size: wp(6),
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  paymentDetailsLabel: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(4),
  },
  paymentDetailsValue: {
    fontFamily: "Gantari-Regular",
    fontSize: wp(4),
  },
});
export default EditInvoicePreviewScreen;
