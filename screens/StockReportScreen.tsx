import { StyleSheet, Text, View, FlatList, Platform } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProductContext } from "../context/productContext";
import { Button, SearchBar } from "@rneui/base";
import { PosReport, Product } from "../type";
import firebase from "firebase/compat";
import { auth, db } from "../firebaseconfig";
import Toast from "react-native-simple-toast";
import { useSalesReportContext } from "../context/salesReportContext";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

const convertTimestampToDate = (
  timestamp: firebase.firestore.Timestamp
): Date => {
  const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6;
  return new Date(milliseconds);
};

const StockReportScreen = () => {
  const { products, updateProduct, setProductList } = useProductContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const startDateHours = new Date();
  startDateHours.setHours(0);
  const [startDate, setStartDate] = useState<Date>(startDateHours);
  const endDateHours = new Date();
  endDateHours.setHours(23);
  const [endDate, setEndDate] = useState<Date>(endDateHours);
  const { salesReports, setSalesReportList } = useSalesReportContext();
  const [initialFetchSales, setInitialFetchSales] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  const filteredData = useMemo(() => {
    const filteredItems = products.filter((item) =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sortedFilteredItems = filteredItems.sort((a, b) =>
      a.productName.toString().localeCompare(b.productName.toString())
    );

    return sortedFilteredItems;
  }, [products, searchQuery]);

  useEffect(() => {
    if (!initialFetchSales) {
      readData();
      setInitialFetchSales(true);
      console.log("read");
    }
    resetTotalStockSold();
    computeTotalStockSold();
  }, [salesReports.length, salesReports]);

  const resetTotalStockSold = () => {
    products.forEach((product) => {
      updateProduct(product.id, { totalStockSold: 0 });
    });
  };
  const readData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        setIsFetching(true);
        const fetched: PosReport[] = [];
        const startDateTimestamp =
          firebase.firestore.Timestamp.fromDate(startDate);
        const endDateTimestamp = firebase.firestore.Timestamp.fromDate(endDate);

        const docRef = db
          .collection("users")
          .doc(user.uid)
          .collection("sales")
          .where("date", ">=", startDateTimestamp)
          .where("date", "<=", endDateTimestamp)
          .orderBy("date", "desc");

        const querySnapshot = await docRef.get();
        querySnapshot.forEach((doc) => {
          const {
            productList,
            date,
            otherExpense,
            customer,
            customerPayment,
            dogTreatDiscount,
            catTreatDiscount,
            gateDiscount,
          } = doc.data();
          const salesReportData = {
            id: doc.id,
            productList,
            date: convertTimestampToDate(date),
            otherExpense,
            customer,
            customerPayment,
            dogTreatDiscount,
            catTreatDiscount,
            gateDiscount,
          };

          fetched.push(salesReportData);
        });

        setSalesReportList(fetched);
        setIsFetching(false);
      }
    } catch (error) {
      Toast.show("Error getting data", Toast.SHORT);
      console.log((error as Error).message);
    }
  };

  const toggleStartDate = () => {
    if (!startDate) {
      setStartDate(new Date());
    }

    setShowStartDate(!showStartDate);
  };
  const toggleEndDate = () => {
    if (!endDate) {
      setEndDate(new Date());
    }

    setShowEndDate(!showEndDate);
  };

  const onChangeStartDate = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === "set" && selectedDate) {
      const currentDate = selectedDate;
      setShowStartDate(showStartDate);
      if (Platform.OS === "android") {
        toggleStartDate();
        setStartDate(currentDate);
      }
    } else {
      toggleStartDate();
    }
  };
  const onChangeEndDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      const currentDate = selectedDate;
      setShowStartDate(showStartDate);
      if (Platform.OS === "android") {
        toggleEndDate();
        setEndDate(currentDate);
      }
    } else {
      toggleEndDate();
    }
  };

  const confirmIosEndDate = () => {
    setEndDate(endDate);
    toggleEndDate();
  };
  const confirmIosStartDate = () => {
    setStartDate(startDate);
    toggleStartDate();
  };

  const formatDateString = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const computeTotalStockSold = () => {
    const productMap = new Map();
    salesReports.forEach((sale) => {
      sale.productList.forEach((boughtItem) => {
        const product = products.find((p) => p.id === boughtItem.product.id);
        if (product) {
          const productId = product.id;
          if (productMap.has(productId)) {
            const currentTotalStockSold = productMap.get(productId);
            productMap.set(
              productId,
              currentTotalStockSold + boughtItem.quantity
            );
          } else {
            productMap.set(productId, boughtItem.quantity);
          }
        }
      });
    });

    productMap.forEach((totalStockSold, productId) => {
      updateProduct(productId, { totalStockSold });
    });
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
      <View style={{ marginHorizontal: 10, flex: 1 }}>
        <View style={{ marginHorizontal: 10 }}></View>
        <SearchBar
          placeholder={"Search Product"}
          containerStyle={{
            backgroundColor: "#f7f7f7",
            borderColor: "white",
          }}
          inputContainerStyle={{ backgroundColor: "#f7f7f7" }}
          round
          autoCapitalize="none"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              flex: 1,
            }}
          >
            <Button
              title={`${
                !startDate ? "Start Date" : formatDateString(startDate)
              }`}
              onPress={toggleStartDate}
              containerStyle={{ borderRadius: 10 }}
              titleStyle={{ fontSize: 14 }}
              buttonStyle={{ backgroundColor: "#af71bd" }}
            />
            <Text style={{ alignSelf: "center" }}> -- </Text>
            <Button
              title={`${!endDate ? "End Date" : formatDateString(endDate)}`}
              onPress={toggleEndDate}
              containerStyle={{ borderRadius: 10 }}
              titleStyle={{ fontSize: 14 }}
              buttonStyle={{ backgroundColor: "#af71bd" }}
            />

            {showStartDate && (
              <DateTimePicker
                mode="date"
                display="calendar"
                value={startDate!}
                onChange={onChangeStartDate}
                minimumDate={new Date(2016, 0, 1)}
              />
            )}
            {showStartDate && Platform.OS === "ios" && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <Button
                  title={"Cancel"}
                  containerStyle={{
                    borderRadius: 10,
                    flex: 1,
                    marginHorizontal: 20,
                  }}
                  buttonStyle={{ backgroundColor: "#af71bd" }}
                  onPress={toggleStartDate}
                />
                <Button
                  title={"Confirm"}
                  containerStyle={{
                    borderRadius: 10,
                    flex: 1,
                    marginHorizontal: 20,
                  }}
                  buttonStyle={{ backgroundColor: "#af71bd" }}
                  onPress={confirmIosStartDate}
                />
              </View>
            )}

            {showEndDate && (
              <DateTimePicker
                mode="date"
                display="calendar"
                value={endDate!}
                onChange={onChangeEndDate}
                minimumDate={new Date(2016, 0, 1)}
              />
            )}
          </View>
          {showStartDate && Platform.OS === "ios" && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <Button
                title={"Cancel"}
                containerStyle={{
                  borderRadius: 10,
                  flex: 1,
                  marginHorizontal: 20,
                }}
                buttonStyle={{ backgroundColor: "#af71bd" }}
                onPress={toggleEndDate}
              />
              <Button
                title={"Confirm"}
                containerStyle={{
                  borderRadius: 10,
                  flex: 1,
                  marginHorizontal: 20,
                }}
                buttonStyle={{ backgroundColor: "#af71bd" }}
                onPress={confirmIosEndDate}
              />
            </View>
          )}
        </View>
        <Button
          title={"Confirm Date"}
          loading={isFetching}
          containerStyle={{
            borderRadius: 10,
            marginHorizontal: 30,
            marginTop: 5,
          }}
          titleStyle={{ fontSize: 14 }}
          buttonStyle={{ backgroundColor: "#af71bd" }}
          onPress={() => {
            readData();
          }}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ flex: 2, fontSize: 12, fontWeight: "bold" }}>
            Product Name
          </Text>
          <Text style={{ flex: 1, fontSize: 12, fontWeight: "bold" }}>
            Current Stock
          </Text>
          <Text style={{ flex: 1, fontSize: 12, fontWeight: "bold" }}>
            Total Stock Sold
          </Text>
        </View>
        <FlatList
          data={filteredData}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderBottomWidth: 2,
              }}
            >
              <Text style={{ fontSize: 12, flex: 2 }}>{item.productName}</Text>
              <Text
                style={{
                  fontSize: 12,
                  flex: 1,
                  color: "blue",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {item.stock}
              </Text>
              <Text style={{ fontSize: 12, flex: 1, textAlign: "center" }}>
                {item.totalStockSold}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default StockReportScreen;

const styles = StyleSheet.create({});
