import { View, Text, FlatList, StyleSheet } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import useGetProducts from "@/hooks/useGetProducts";
import useProductsArray from "@/hooks/useProductsArray";
import searchProductsByName from "@/methods/search/searchProductsByName";
import { primary, strongPrimary } from "@/theme/backgroundTheme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import SearchBar from "@/components/searchbars/SearchBar";
import { useTransactionContext } from "@/contexts/TransactionContext";
import Transaction from "@/types/Transaction";
import DatePicker from "react-native-date-picker";
import CommonButton from "@/components/buttons/CommonButton";
import { api } from "@/config/axios-api";
import { isAxiosError } from "axios";

const StockReportListScreen = () => {
  const { products } = useGetProducts();
  const { productsArray } = useProductsArray(products);
  const { transactions, setTransactions } = useTransactionContext();
  // search bar
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return searchProductsByName(productsArray, searchQuery);
  }, [productsArray, searchQuery]);

  const productTotalStockSold = useMemo(() => {
    return calculateTotalStockSold(transactions);
  }, [transactions]);

  // date range
  // startDate
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isStartDatePickerVisible, setIsStartDatePickerVisible] =
    useState(false);

  // endDate
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);

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

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(2),
      }}
    >
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={"Search Products..."}
      />
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

      <View style={{ flexDirection: "row", marginTop: hp(1) }}>
        <Text style={[styles.labelStyle, { width: wp(55) }]}>Product</Text>
        <Text
          style={[styles.labelStyle, { width: wp(20), textAlign: "center" }]}
        >
          Current Stock
        </Text>
        <Text
          style={[styles.labelStyle, { width: wp(20), textAlign: "center" }]}
        >
          Stock Sold
        </Text>
      </View>
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <View
            style={{
              borderColor: strongPrimary,
              borderBottomWidth: wp(0.2),
              paddingVertical: wp(1),
              flexDirection: "row",
            }}
          >
            <Text style={[styles.valueStyle, { width: wp(55) }]}>
              {item.productName}
            </Text>
            <Text
              style={[
                styles.valueStyle,
                { width: wp(20), color: "#60B5FF", textAlign: "center" },
              ]}
            >
              {item.stock}
            </Text>
            <Text
              style={[
                styles.valueStyle,
                { width: wp(20), textAlign: "center" },
              ]}
            >
              {productTotalStockSold[item.id] || 0}
            </Text>
          </View>
        )}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

export default StockReportListScreen;

const styles = StyleSheet.create({
  valueStyle: {
    fontFamily: "Gantari-Regular",
    fontSize: wp(3.5),
  },
  labelStyle: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(4),
  },
});

const calculateTotalStockSold = (
  transactions: Transaction[]
): Record<string, number> => {
  const total = transactions.reduce<Record<string, number>>((acc, t) => {
    t.items.forEach((item) => {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
    });
    return acc;
  }, {});

  return total;
};
