import {
  View,
  TouchableOpacity,
  FlatList,
  Text,
  Keyboard,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { primary, secondary, strongPrimary } from "@/theme/backgroundTheme";
import SearchBar from "@/components/searchbars/SearchBar";
import CommonButton from "@/components/buttons/CommonButton";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import DatePicker from "react-native-date-picker";
import { useCustomerContext } from "@/contexts/CustomerContext";
import { useTransactionContext } from "@/contexts/TransactionContext";
import { router, useFocusEffect } from "expo-router";
import Transaction from "@/types/Transaction";
import { useProductContext } from "@/contexts/ProductContext";
import calculateTotalCashPayment from "@/methods/invoice/report/calculateTotalCashPayment";
import calculateTotalOnlinePayment from "@/methods/invoice/report/calculateTotalOnlinePayment";
import calculateTotalDiscount from "@/methods/invoice/report/calculateTotalDiscount";
import calculateTotalFreebies from "@/methods/invoice/report/calculateTotalFreebies";
import calculateTotalPayment from "@/methods/invoice/report/calculateTotalPayment";
import calculateTotalPriceSold from "@/methods/invoice/report/calculateTotalPriceSold";
import calculateTotalProfit from "@/methods/invoice/report/calculateTotalProfit";
import ModalTemplate from "@/components/modals/ModalTemplate";
import { Checkbox } from "expo-checkbox";
import { api } from "@/config/axios-api";
import { isAxiosError } from "axios";
import Toast from "react-native-toast-message";
import SelectedProduct from "@/types/SelectedProduct";
import calculateSubTotalPrice from "@/methods/invoice/calculateSubTotalPrice";
import calculateInvoiceTotalPrice from "@/methods/invoice/calculateInvoiceTotalPrice";
import calculateSingleTransactionProfit from "@/methods/invoice/calculateTotalProfit";
import InvoiceForm from "@/types/InvoiceForm";

const TransactionListScreen = () => {
  // startDate
  const [isStartDatePickerVisible, setIsStartDatePickerVisible] =
    useState(false);

  // endDate
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);

  // for list
  const {
    transactions,
    setTransactions,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useTransactionContext();
  const { customers } = useCustomerContext();
  const { products } = useProductContext();
  const [loading, setLoading] = useState(false);
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(
    new Set()
  );

  // Get transactions function
  const getTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/transactions", {
        params: {
          startDate,
          endDate,
        },
      });
      setTransactions(response.data.items);
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({
          type: "error",
          text1: `${error.response?.data.error}`,
        });
      }
      console.error("Get Transaction Failed: ", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, setTransactions]);

  useFocusEffect(
    useCallback(() => {
      getTransactions();
    }, [getTransactions])
  );

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);
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

  // for transaction flatlist
  const renderTransactions = useCallback(
    ({ item, index }: { item: Transaction; index: number }) => {
      const customer = customers[item.customerId];
      const isExpanded = expandedTransactions.has(item.id);
      const selectedProducts =
        convertTransactionItemsToSelectedProductArray(item);
      const invoiceForm = convertTransactionToInvoiceForm(item, customer);
      const totalPayment = calculateInvoiceTotalPrice(
        invoiceForm,
        selectedProducts
      );
      const totalProfit = calculateSingleTransactionProfit(
        selectedProducts,
        invoiceForm
      );

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
              {index + 1}. {customer?.customerName || "Unknown"}
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
                <RenderReportValuePair
                  label="Total Profit"
                  value={totalProfit}
                />
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
                    pathname: "../[id]",
                    params: { id: item.id },
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
    ]
  );

  //hide the report summary when searching
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  // search query
  const [searchQuery, setSearchQuery] = useState("");
  // filter options
  type NameFilter = "Customer" | "Product";
  type PaymentFilter = "All" | "Cash" | "Online";

  const nameFilterOptions: NameFilter[] = ["Customer", "Product"];
  const paymentFilterOptions: PaymentFilter[] = ["All", "Cash", "Online"];

  const [nameFilter, setNameFilter] = useState<NameFilter>("Customer");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("All");
  const [filerModalVisible, setFilterModalVisible] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // --- Payment filter ---
        if (paymentFilter === "Cash" && t.cashPayment === 0) return false;
        if (paymentFilter === "Online" && t.onlinePayment === 0) return false;

        // --- Name / search filter ---
        if (nameFilter === "Customer") {
          return customers[t.customerId].customerName
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        } else if (nameFilter === "Product") {
          return t.items.some((item) => {
            // temporary fix for product not found
            const product = products[item.productId];
            if (!product) return false;
            return products[item.productId].productName
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          });
        }

        return true; // fallback
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [
    transactions,
    paymentFilter,
    nameFilter,
    customers,
    searchQuery,
    products,
  ]);

  // render the options
  const renderSection = <T extends string>(
    title: string,
    options: readonly T[],
    selected: T,
    onChange: (value: T) => void
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={styles.option}
          onPress={() => onChange(opt)}
        >
          <Checkbox
            value={selected === opt}
            onValueChange={() => onChange(opt)}
            style={styles.checkbox}
          />
          <Text style={styles.optionText}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
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
      <View style={{ flexDirection: "row", gap: wp(2) }}>
        <SearchBar
          onChangeText={setSearchQuery}
          value={searchQuery}
          placeholder={
            nameFilter === "Product"
              ? "Search By Products..."
              : "Search By Customers..."
          }
          row
        />
        <TouchableOpacity
          style={{
            padding: wp(2),
            borderRadius: wp(4),
            backgroundColor: secondary,
          }}
        >
          <Ionicons
            name="funnel"
            size={24}
            color={"black"}
            onPress={() => setFilterModalVisible(true)}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: wp(10),
        }}
      >
        <CommonButton
          onPress={() => {
            setIsStartDatePickerVisible(true);
          }}
          title={
            startDate
              ? startDate.toLocaleString("en-PH", {
                  dateStyle: "medium",
                })
              : "Start Date"
          }
          backgroundColor={"#FFDABF"}
          titleColor={"#9A3412"}
          marginTop={hp(1)}
          iconLeft={{
            family: "AntDesign",
            name: "calendar",
            color: "#9A3412",
            size: wp(5.5),
          }}
        />
        <CommonButton
          onPress={() => {
            setIsEndDatePickerVisible(true);
          }}
          title={
            endDate
              ? endDate.toLocaleString("en-PH", {
                  dateStyle: "medium",
                })
              : "End Date"
          }
          backgroundColor={"#FFDABF"}
          titleColor={"#9A3412"}
          marginTop={hp(1)}
          iconLeft={{
            family: "AntDesign",
            name: "calendar",
            color: "#9A3412",
            size: wp(5.5),
          }}
        />
      </View>
      {
        // start date picker
      }
      <DatePicker
        modal
        open={isStartDatePickerVisible}
        date={startDate ?? new Date()}
        mode="date"
        onConfirm={(selectedDate) => {
          setIsStartDatePickerVisible(false);
          selectedDate.setHours(0, 0, 0, 0);
          setStartDate(selectedDate);
        }}
        onCancel={() => setIsStartDatePickerVisible(false)}
      />
      {
        // end date picker
      }
      <DatePicker
        modal
        open={isEndDatePickerVisible}
        date={endDate ?? new Date()}
        mode="date"
        onConfirm={(selectedDate) => {
          setIsEndDatePickerVisible(false);
          selectedDate.setHours(11, 59, 59, 999);
          setEndDate(selectedDate);
        }}
        onCancel={() => setIsEndDatePickerVisible(false)}
      />

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: hp(2),
          }}
        >
          <ActivityIndicator size="large" color="#FF9149" />
        </View>
      ) : filteredTransactions.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: hp(4),
          }}
        >
          <Text
            style={{
              fontFamily: "Gantari-Regular",
              fontSize: wp(4),
              color: "#6B7280",
            }}
          >
            No transactions found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactions}
          style={{
            marginTop: hp(1),
          }}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
      {/* Summary */}
      {!isKeyboardVisible && (
        <View
          style={{
            padding: wp(2.5),
            borderRadius: wp(1),
            borderTopWidth: wp(1),
            borderColor: strongPrimary,
            backgroundColor: "rgba(255,255,255,0.85)",
          }}
        >
          <RenderReportValuePair
            label="Total Cash Payment"
            value={calculateTotalCashPayment(filteredTransactions)}
          />
          <RenderReportValuePair
            label="Total Online Payment"
            value={calculateTotalOnlinePayment(filteredTransactions)}
          />
          <RenderReportValuePair
            label="Total Discount"
            value={calculateTotalDiscount(filteredTransactions)}
          />
          <RenderReportValuePair
            label="Total Freebies"
            value={calculateTotalFreebies(filteredTransactions)}
          />
          <RenderReportValuePair
            label="Total Payment"
            value={calculateTotalPayment(filteredTransactions)}
          />
          <RenderReportValuePair
            label="Total Price Sold"
            value={calculateTotalPriceSold(filteredTransactions, products)}
          />
          <RenderReportValuePair
            label="Total Profit"
            value={calculateTotalProfit(filteredTransactions, products)}
          />
        </View>
      )}

      <ModalTemplate
        visible={filerModalVisible}
        onClose={() => setFilterModalVisible(false)}
        height={hp(45)}
        width={wp(90)}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: wp(3),
            marginBottom: hp(1),
            paddingHorizontal: wp(1),
          }}
        >
          <Ionicons name="funnel" size={wp(7)} color={strongPrimary} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Gantari-Bold",
                fontSize: wp(4.4),
                color: "#111827",
              }}
            >
              Filters
            </Text>
            <Text
              style={{
                fontFamily: "Gantari-Regular",
                fontSize: wp(3.4),
                color: "#6B7280",
                marginTop: hp(0.2),
              }}
            >
              Narrow down transactions by name or payment type.
            </Text>
          </View>
        </View>

        <View style={{ maxHeight: hp(38), marginTop: hp(1) }}>
          {/* sections are scrollable in case content grows */}
          <ScrollView contentContainerStyle={{ paddingBottom: hp(1) }}>
            {renderSection<NameFilter>(
              "Filter by name",
              nameFilterOptions,
              nameFilter,
              setNameFilter
            )}
            {renderSection<PaymentFilter>(
              "Filter by payment",
              paymentFilterOptions,
              paymentFilter,
              setPaymentFilter
            )}
          </ScrollView>
        </View>

        <View
          style={{
            marginTop: hp(2),
            flexDirection: "row",
            justifyContent: "space-between",
            gap: wp(3),
          }}
        >
          <CommonButton
            title="Cancel"
            onPress={() => setFilterModalVisible(false)}
            backgroundColor="#F3F4F6"
            titleColor="#111827"
            marginTop={0}
          />
          <CommonButton
            title="Apply"
            onPress={() => {
              setFilterModalVisible(false);
            }}
            backgroundColor={strongPrimary}
            titleColor={primary}
            marginTop={0}
          />
        </View>
      </ModalTemplate>
    </View>
  );
};

export default TransactionListScreen;

const styles = StyleSheet.create({
  container: {
    padding: wp(3), // previously 12
  },
  section: {
    marginBottom: hp(1.5), // previously 12
  },
  sectionTitle: {
    fontFamily: "Gantari-Bold",
    fontSize: wp(3.5), // previously 14
    marginBottom: hp(0.8), // previously 6
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.8), // previously 6
  },
  checkbox: {
    marginRight: wp(2), // previously 8
  },
  optionText: {
    fontSize: wp(3.5), // previously
    fontFamily: "Gantari-Regular",
  },
  applyButton: {
    backgroundColor: "#007AFF",
    paddingVertical: hp(1.2), // previously 8
    paddingHorizontal: wp(3), // previously 12
    borderRadius: wp(2), // previously 6
    alignItems: "center",
    marginTop: hp(1.5), // previously 10
  },
  applyText: {
    color: "white",
    fontWeight: "600",
  },
});
