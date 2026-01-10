import { FlatList, Text, TouchableOpacity, View } from "react-native";

import React, { useCallback, useMemo, useState } from "react";

import { primary, strongPrimary } from "@/theme/backgroundTheme";

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

import { useRecentTransactionContext } from "@/contexts/RecentTransactionContext";

import { useCustomerContext } from "@/contexts/CustomerContext";

import { FontAwesome6, Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";
import { useProductContext } from "@/contexts/ProductContext";
import { useUserContext } from "@/contexts/UserContext";
import Transaction from "@/types/Transaction";
import SelectedProduct from "@/types/SelectedProduct";
import InvoiceForm from "@/types/InvoiceForm";
import calculateSubTotalPrice from "@/methods/invoice/calculateSubTotalPrice";
import calculateInvoiceTotalPrice from "@/methods/invoice/calculateInvoiceTotalPrice";
import calculateTotalProfit from "@/methods/invoice/calculateTotalProfit";

const RecentTransactionScreen = () => {
  const { recentTransactions } = useRecentTransactionContext();

  const { customers } = useCustomerContext();
  const { products } = useProductContext();
  const { role } = useUserContext();

  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(
    new Set()
  );

  const sortedRecentTransactions = useMemo(() => {
    return recentTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentTransactions, products]);

  // Toggle transaction expansion
  const toggleTransactionExpansion = useCallback((transactionId: string) => {
    setExpandedTransactions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  }, []);

  // Convert transaction items to SelectedProduct array
  const convertTransactionItemsToSelectedProductArray = useCallback(
    (transaction: Transaction): SelectedProduct[] => {
      return transaction.items.map((item) => {
        const product = products[item.productId];
        if (!product) {
          // Return a placeholder if product not found
          return {
            id: item.productId,
            productName: "Product not found",
            stockPrice: 0,
            sellPrice: 0,
            stock: 0,
            imageUrl: "",
            deleted: false,
            quantity: item.quantity,
          };
        }
        return { ...product, quantity: item.quantity, id: item.productId };
      });
    },
    [products]
  );

  // Convert transaction to InvoiceForm
  const convertTransactionToInvoiceForm = useCallback(
    (transaction: Transaction, customer: any): InvoiceForm => {
      return {
        cashPayment: transaction.cashPayment
          ? transaction.cashPayment.toFixed(2)
          : "0",
        onlinePayment: transaction.onlinePayment
          ? transaction.onlinePayment.toFixed(2)
          : "0",
        customer: customer ? { ...customer, id: transaction.customerId } : null,
        date: new Date(transaction.date),
        discount: transaction.discount ? transaction.discount.toString() : "0",
        freebies: transaction.freebies ? transaction.freebies.toString() : "0",
        deliveryFee: transaction.deliveryFee
          ? transaction.deliveryFee.toString()
          : "0",
      };
    },
    []
  );

  // for transaction flatlist
  const renderTransactions = useCallback(
    ({ item, index }: { item: Transaction; index: number }) => {
      const customer = customers[item.customerId];
      const customerName = customer?.customerName || "Unknown";
      const isExpanded = expandedTransactions.has(item.id);
      const selectedProducts =
        convertTransactionItemsToSelectedProductArray(item);
      const invoiceForm = convertTransactionToInvoiceForm(item, customer);
      const totalPayment = calculateInvoiceTotalPrice(
        invoiceForm,
        selectedProducts
      );
      const totalProfit = calculateTotalProfit(selectedProducts, invoiceForm);

      return (
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.85)",
            borderColor: "rgba(0,0,0,0.6)",
            borderWidth: 1,
            marginVertical: hp(0.5),
            borderRadius: wp(4),
            overflow: "hidden",
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              padding: wp(4),
              justifyContent: "space-between",
              alignItems: "center",
            }}
            activeOpacity={0.7}
            onPress={() => toggleTransactionExpansion(item.id)}
          >
            <Text
              style={{
                flex: 1,
                marginRight: hp(0.5),
                fontFamily: "Gantari-SemiBold",
                fontSize: wp(4.5),
                color:
                  item.cashPayment === 0 && item.onlinePayment === 0
                    ? "red"
                    : "black",
              }}
            >
              {index + 1}. {customerName}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: wp(1),
              }}
            >
              <FontAwesome6 name="clock-four" size={wp(4)} color="black" />
              <Text
                style={{
                  fontFamily: "Gantari-Regular",
                  fontSize: wp(3.5),
                }}
              >
                {new Date(item.date).toLocaleString("en-PH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Text>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={wp(5)}
                color="black"
                style={{ marginLeft: wp(2) }}
              />
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <View
              style={{
                padding: wp(4),
                borderTopWidth: 1,
                borderTopColor: "rgba(0,0,0,0.2)",
                gap: hp(1.5),
              }}
            >
              {/* Products Bought */}
              <View>
                <Text
                  style={{
                    fontFamily: "Gantari-SemiBold",
                    fontSize: wp(4),
                    marginBottom: hp(1),
                  }}
                >
                  Products Bought
                </Text>
                <FlatList
                  data={selectedProducts}
                  scrollEnabled={false}
                  renderItem={({ item: product }) => (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginVertical: hp(0.3),
                        paddingVertical: hp(0.5),
                        borderBottomWidth: wp(0.1),
                        borderBottomColor: "rgba(0,0,0,0.2)",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: "Gantari-SemiBold",
                            fontSize: wp(3.8),
                          }}
                        >
                          {product.productName}
                        </Text>
                        <View style={{ flexDirection: "row" }}>
                          <Text
                            style={{
                              fontFamily: "Gantari-Regular",
                              fontSize: wp(3.5),
                              color: "#ff6347",
                            }}
                          >
                            {product.quantity}{" "}
                          </Text>
                          <Text
                            style={{
                              fontFamily: "Gantari-Regular",
                              fontSize: wp(3.5),
                            }}
                          >
                            x ₱ {product.sellPrice.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{
                          fontFamily: "Gantari-SemiBold",
                          fontSize: wp(3.5),
                          textAlign: "right",
                          flex: 0.5,
                        }}
                      >
                        ₱ {calculateSubTotalPrice(product).toFixed(2)}
                      </Text>
                    </View>
                  )}
                  keyExtractor={(product, idx) => `${product.id}-${idx}`}
                />
              </View>

              {/* Payment Information */}
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: "rgba(0,0,0,0.2)",
                  paddingTop: hp(1),
                  gap: hp(0.5),
                }}
              >
                <Text
                  style={{
                    fontFamily: "Gantari-SemiBold",
                    fontSize: wp(4),
                    marginBottom: hp(0.5),
                  }}
                >
                  Payment Information
                </Text>
                <RenderReportValuePair
                  label="Cash Payment"
                  value={item.cashPayment || 0}
                />
                <RenderReportValuePair
                  label="Online Payment"
                  value={item.onlinePayment || 0}
                />
                <RenderReportValuePair
                  label="Total Payment"
                  value={totalPayment}
                />
                {role === "admin" && (
                  <RenderReportValuePair
                    label="Total Profit"
                    value={totalProfit}
                  />
                )}
              </View>

              {/* View Details Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: strongPrimary,
                  padding: wp(3),
                  borderRadius: wp(2),
                  alignItems: "center",
                  marginTop: hp(0.5),
                }}
                activeOpacity={0.7}
                onPress={() => {
                  router.push({
                    pathname: "./recent/details",
                    params: { recentId: item.id },
                  });
                }}
              >
                <Text
                  style={{
                    fontFamily: "Gantari-SemiBold",
                    fontSize: wp(4),
                    color: primary,
                  }}
                >
                  View Full Details
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    },
    [
      customers,
      expandedTransactions,
      convertTransactionItemsToSelectedProductArray,
      convertTransactionToInvoiceForm,
      toggleTransactionExpansion,
      role,
    ]
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(2),
      }}
    >
      <Text
        style={{
          fontFamily: "Gantari-Medium",
          fontSize: wp(4.5),
          textAlign: "center",
          marginBottom: hp(1),
        }}
      >
        Today&apos;s Transactions
      </Text>
      <FlatList
        data={sortedRecentTransactions}
        renderItem={renderTransactions}
      />
    </View>
  );
};

export default RecentTransactionScreen;

// render key value pair
type RenderLabelValuePairProps = {
  label: string;
  value: number;
};

const RenderReportValuePair: React.FC<RenderLabelValuePairProps> = ({
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
          fontFamily: "Gantari-Medium",
          fontSize: wp(5),
          color: "rgba(0,0,0,0.6)",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: "Gantari-SemiBold",
          fontSize: wp(5),
          textAlign: "right",
          flex: 2,
        }}
      >
        ₱ {value.toFixed(2)}
      </Text>
    </View>
  );
};
