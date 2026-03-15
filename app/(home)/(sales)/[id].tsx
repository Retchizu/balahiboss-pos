import { View, Text, DimensionValue, StyleSheet } from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useCustomerContext } from "@/contexts/CustomerContext";
import { useProductContext } from "@/contexts/ProductContext";
import { useConvertTransactionArrayToMap } from "@/hooks/useConvertTransactionArrayToMap";
import SelectedProduct from "@/types/SelectedProduct";
import calculateTotalProfit from "@/methods/invoice/calculateTotalProfit";
import InvoiceForm from "@/types/InvoiceForm";
import { FlatList } from "react-native-gesture-handler";
import calculateSubTotalPrice from "@/methods/invoice/calculateSubTotalPrice";
import { AntDesign, FontAwesome5, Entypo } from "@expo/vector-icons";
import CommonButton from "@/components/buttons/CommonButton";
import calculateInvoiceTotalPrice from "@/methods/invoice/calculateInvoiceTotalPrice";
import { isAxiosError } from "axios";
import { api } from "@/config/axios-api";
import ModalTemplate from "@/components/modals/ModalTemplate";
import { useInvoiceFormContext } from "@/contexts/InvoiceFormContext";
import { useSelectedProductContext } from "@/contexts/SelectedProductContext";
import Toast from "react-native-toast-message";

const TransactionDetailScreen = () => {
  const { primary, textOnStrongPrimary, textMuted } = useTheme();
  // params
  const { id } = useLocalSearchParams();
  const parsedId = id as string;
  const { transactionMap } = useConvertTransactionArrayToMap(false);

  const transaction = transactionMap[parsedId];

  const { customers } = useCustomerContext();
  const { products } = useProductContext();

  const customer = customers[transaction.customerId];

  // convert transaction.items to selectedProduct for calculating prices
  const convertTransactionItemsToSelectedProductArray =
    (): SelectedProduct[] => {
      return transaction.items.map((item) => {
        const product = products[item.productId];

        return { ...product, quantity: item.quantity, id: item.productId };
      });
    };

  // convert transaction to invoiceForm for calculating prices
  const convertTransactionToInvoiceForm = (): InvoiceForm => {
    return {
      cashPayment: transaction.cashPayment
        ? transaction.cashPayment.toFixed(2)
        : "0",
      onlinePayment: transaction.onlinePayment
        ? transaction.onlinePayment.toFixed(2)
        : "0",
      customer: { ...customer, id: transaction.customerId },
      date: new Date(transaction.date),
      discount: transaction.discount ? transaction.discount.toString() : "0",
      freebies: transaction.freebies ? transaction.freebies.toString() : "0",
      deliveryFee: transaction.deliveryFee
        ? transaction.deliveryFee.toString()
        : "0",
    };
  };

  // delete transaction
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const deleteTransaction = async () => {
    try {
      setIsDeletingTransaction(true);
      const response = await api.delete(
        `/transactions/delete/${transaction.id}`
      );
      Toast.show({ type: "success", text1: `${response?.data.message}` });
      router.replace("../list");
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({ type: "error", text1: `${error.response?.data.error}` });
      }
      console.error(error);
    } finally {
      setIsDeletingTransaction(false);
      setIsDeleteModalVisible(false);
    }
  };

  // setInvoiceForm for update
  const { setInvoiceForm } = useInvoiceFormContext();
  // set selectedProducts for update
  const { setSelectedProductList } = useSelectedProductContext();

  // convert transaction items to selected products map
  const convertTransactionItemsToSelectedProductMap = (): Map<
    string,
    SelectedProduct
  > => {
    const selectedProductArray =
      convertTransactionItemsToSelectedProductArray();
    const selectedProductMap = new Map();
    for (const selectedProduct of selectedProductArray) {
      console.log("selectedProduct", selectedProduct);
      selectedProductMap.set(selectedProduct.id, selectedProduct);
    }

    return selectedProductMap;
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(2),
        gap: hp(1.5),
      }}
    >
      {
        // customer info
      }
      <TransactionDetailCardView>
        <View
          style={{ flexDirection: "row", gap: wp(1), alignItems: "center" }}
        >
          <AntDesign name="user" size={wp(4)} color="black" />
          <Text style={{ fontFamily: "Gantari-Medium", fontSize: wp(4) }}>
            Customer Information
          </Text>
        </View>
        <RenderLabelValuePair
          label={"Customer"}
          value={customer.customerName}
        />
        <RenderLabelValuePair
          label={"Date & Time"}
          value={new Date(transaction.date).toLocaleString("en-PH", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        />
      </TransactionDetailCardView>

      {
        // products bought
      }
      <TransactionDetailCardView height={hp(30)}>
        <View
          style={{ flexDirection: "row", gap: wp(1), alignItems: "center" }}
        >
          <AntDesign name="shoppingcart" size={wp(4)} color="black" />
          <Text style={{ fontFamily: "Gantari-Medium", fontSize: wp(4) }}>
            Products Bought
          </Text>
        </View>
        <FlatList
          style={{ marginVertical: hp(0.5) }}
          data={convertTransactionItemsToSelectedProductArray()}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: hp(0.5),
                borderColor: "rgba(0,0,0,0.6)",
                borderBottomWidth: wp(0.1),
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentDetailsLabel}>
                  {item.productName}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={[
                      styles.paymentDetailsValue,
                      { color: "#ff6347", fontFamily: "Gantari-SemiBold" },
                    ]}
                  >
                    {item.quantity}{" "}
                  </Text>
                  <Text style={styles.paymentDetailsValue}>
                    x ₱ {item.sellPrice.toFixed(2)}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.paymentDetailsValue,
                  { textAlign: "right", flex: 0.5 },
                ]}
              >
                ₱ {calculateSubTotalPrice(item).toFixed(2)}
              </Text>
            </View>
          )}
        />
      </TransactionDetailCardView>
      {
        // payment info
      }

      <TransactionDetailCardView>
        <View
          style={{ flexDirection: "row", gap: wp(1), alignItems: "center" }}
        >
          <FontAwesome5 name="money-bill" size={wp(4)} color="black" />
          <Text style={{ fontFamily: "Gantari-Medium", fontSize: wp(4) }}>
            Payment Information
          </Text>
        </View>
        <RenderLabelValuePair
          label={"Cash Payment"}
          value={
            transaction.cashPayment
              ? `₱ ${transaction.cashPayment.toFixed(2)}`
              : `₱ ${(0).toFixed(2)}`
          }
        />
        <RenderLabelValuePair
          label={"Online Payment"}
          value={
            transaction.onlinePayment
              ? `₱ ${transaction.onlinePayment.toFixed(2)}`
              : `₱ ${(0).toFixed(2)}`
          }
        />
        {transaction.discount != null && (
          <RenderLabelValuePair
            label={"Discount"}
            value={`₱ ${transaction.discount.toFixed(2)}`}
          />
        )}
        {transaction.freebies != null && (
          <RenderLabelValuePair
            label={"Freebies"}
            value={`₱ ${transaction.freebies.toFixed(2)}`}
          />
        )}
      </TransactionDetailCardView>
      {
        // calculations
      }
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TransactionDetailCardView height={hp(10)} width={wp(45)}>
          <Text
            style={{
              fontFamily: "Gantari-Regular",
              fontSize: wp(4),
              color: labelColor,
              textAlign: "center",
            }}
          >
            Total Amount
          </Text>
          <Text
            style={{
              fontFamily: "Gantari-Regular",
              fontSize: wp(4),
              textAlign: "center",
            }}
          >
            ₱{" "}
            {calculateInvoiceTotalPrice(
              convertTransactionToInvoiceForm(),
              convertTransactionItemsToSelectedProductArray()
            ).toFixed(2)}
          </Text>
        </TransactionDetailCardView>
        <TransactionDetailCardView height={hp(10)} width={wp(45)}>
          <Text
            style={{
              fontFamily: "Gantari-Regular",
              fontSize: wp(4),
              color: labelColor,
              textAlign: "center",
            }}
          >
            Total Profit
          </Text>
          <Text
            style={{
              fontFamily: "Gantari-Regular",
              fontSize: wp(4),
              textAlign: "center",
            }}
          >
            ₱{" "}
            {calculateTotalProfit(
              convertTransactionItemsToSelectedProductArray(),
              convertTransactionToInvoiceForm()
            ).toFixed(2)}
          </Text>
        </TransactionDetailCardView>
      </View>

      <TransactionDetailCardView>
        <View style={{ flexDirection: "row", gap: wp(3)}}>
          <CommonButton
            onPress={() => {
              setSelectedProductList(
                convertTransactionItemsToSelectedProductMap()
              );
              setInvoiceForm(convertTransactionToInvoiceForm());
              router.push({
                pathname: "./(edit)/invoice/",
                params: { id: transaction.id },
              });
            }}
            title="Update"
            row
          />
          <CommonButton
            onPress={() => {
              setIsDeleteModalVisible(true);
            }}
            title="Delete"
            row
            loading={isDeletingTransaction}
          />
        </View>
      </TransactionDetailCardView>

      <ModalTemplate
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        height={hp(34)}
        width={wp(88)}
      >
        <View style={{ alignItems: "center", paddingHorizontal: wp(3) }}>
          <Entypo
            name="trash"
            size={wp(14)}
            color="#ef4444"
            style={{ marginBottom: hp(1) }}
          />
          <Text
            style={{
              fontFamily: "Gantari-Bold",
              fontSize: wp(5),
              textAlign: "center",
            }}
          >
            Delete {customer.customerName}&apos;s transaction?
          </Text>
          <Text
            style={{
              fontFamily: "Gantari-Regular",
              fontSize: wp(4),
              color: textMuted,
              textAlign: "center",
              marginTop: hp(1),
              lineHeight: hp(2.4),
            }}
          >
            This action cannot be undone. The transaction will be permanently
            removed.
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: wp(3),
            marginTop: hp(3),
          }}
        >
          <CommonButton
            title="Cancel"
            onPress={() => setIsDeleteModalVisible(false)}
            backgroundColor="#F3F4F6"
            titleColor={textOnStrongPrimary}
            marginTop={0}
          />
          <CommonButton
            title="Delete"
            onPress={async () => await deleteTransaction()}
            backgroundColor="#ef4444"
            titleColor="#ffffff"
            marginTop={0}
            loading={isDeletingTransaction}
          />
        </View>
      </ModalTemplate>
    </View>
  );
};

export default TransactionDetailScreen;

const labelColor = "rgba(0,0,0,0.6)";

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

// render key value pair
type RenderLabelValuePairProps = {
  label: string;
  value: string;
};

const RenderLabelValuePair: React.FC<RenderLabelValuePairProps> = ({
  label,
  value,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Text
        style={{
          fontFamily: "Gantari-Regular",
          color: labelColor,
          fontSize: wp(4),
          flex: 1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: "Gantari-Regular",
          fontSize: wp(4),
          textAlign: "right",
          flex: 2,
        }}
      >
        {value}
      </Text>
    </View>
  );
};

type TransactionDetailCardViewProp = {
  height?: DimensionValue | undefined;
  width?: DimensionValue | undefined;
  children: React.ReactNode;
};

// cardView
const TransactionDetailCardView = ({
  children,
  width,
  height,
}: TransactionDetailCardViewProp) => {
  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.85)",
        borderColor:"rgba(0,0,0,0.6)",
        borderWidth:wp(0.3),
        padding: wp(1),
        borderRadius: wp(5),
        height,
        width,
      }}
    >
      <View
        style={{
          borderRadius: wp(4),
          padding: wp(4),
        }}
      >
        {children}
      </View>
    </View>
  );
};
