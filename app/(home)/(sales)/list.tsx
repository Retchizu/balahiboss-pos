import {
  View,
  TouchableOpacity,
  FlatList,
  Text,
  Keyboard,
  StyleSheet,
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
import { api } from "@/config/axios-api";
import { isAxiosError } from "axios";
import { useCustomerContext } from "@/contexts/CustomerContext";
import { useTransactionContext } from "@/contexts/TransactionContext";
import { router } from "expo-router";
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

const TransactionListScreen = () => {
  // startDate
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isStartDatePickerVisible, setIsStartDatePickerVisible] =
    useState(false);

  // endDate
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);

  // for list
  const { transactions, setTransactions } = useTransactionContext();
  const { customers } = useCustomerContext();
  const { products } = useProductContext();

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

  // get transactions
  useEffect(() => {
    const getTransactions = async () => {
      try {
        const response = await api.get("/transaction/list", {
          params: {
            startDate,
            endDate,
          },
        });
        console.log(response.data.items);
        setTransactions(response.data.items);
      } catch (error) {
        if (isAxiosError(error)) {
          console.error(
            "Get Transaction Failed: ",
            error.response?.data.message
          );
        }
        console.error("Get Transaction Failed: ", error);
      }
    };

    getTransactions();
  }, [endDate, setTransactions, startDate, products]);

  // for transaction flatlist
  const renderTransactions = useCallback(
    ({ item }: { item: Transaction }) => {
      const customer = customers[item.customerId];
      return (
        <TouchableOpacity
          style={{
            flexDirection: "row",
            padding: wp(4),
            backgroundColor: secondary,
            justifyContent: "space-between",
            alignItems: "center",
            marginVertical: hp(0.5),
            borderRadius: wp(4),
          }}
          activeOpacity={0.7}
          onPress={() => {
            console.log(item.id);
            router.push({
              pathname: "../[id]",
              params: { id: item.id },
            });
          }}
        >
          <Text
            style={{
              flex: 1,
              marginRight: hp(0.5),
              fontFamily: "Gantari-SemiBold",
              fontSize: wp(4.5),
            }}
          >
            {customer.customerName}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: wp(1),
            }}
          >
            <FontAwesome6 name="clock-four" size={wp(4)} color="black" />
            <Text style={{ fontFamily: "Gantari-Regular", fontSize: wp(3.5) }}>
              {new Date(item.date).toLocaleString("en-PH", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [customers]
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
          return t.items.some((item) =>
            products[item.productId].productName
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          );
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
          placeholder={nameFilter === "Product" ? "Search By Products..." : "Search By Customers..."}
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
        style={{ flexDirection: "row", justifyContent: "center", gap: wp(10) }}
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
          backgroundColor={strongPrimary}
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
          backgroundColor={strongPrimary}
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
      {!isKeyboardVisible && (
        <View style={{ elevation: 2, padding: wp(2.5), borderRadius: wp(1) }}>
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
      >
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

        <CommonButton
          title="Close"
          onPress={() => {
            setFilterModalVisible(false);
          }}
          titleColor={primary}
        />
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
    fontFamily:"Gantari-Bold",
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
    fontFamily:"Gantari-Regular",
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
