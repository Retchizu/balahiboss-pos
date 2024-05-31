import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, SearchBar } from "@rneui/base";
import { AntDesign } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Toast from "react-native-simple-toast";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { auth, db } from "../firebaseconfig";
import { PosReport, Product, ReportRootStackParamList } from "../type";
import { useSalesReportContext } from "../context/salesReportContext";

const convertTimestampToDate = (
  timestamp: firebase.firestore.Timestamp
): Date => {
  const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6;
  return new Date(milliseconds);
};

type prop = NativeStackScreenProps<
  ReportRootStackParamList,
  "SalesReportScreen"
>;
const SalesReportScreen = ({ navigation }: prop) => {
  const [initialFetchSales, setInitialFetchSales] = useState(false);
  const { salesReports, setSalesReportList } = useSalesReportContext();
  const startDateHours = new Date();
  startDateHours.setHours(0);
  const [startDate, setStartDate] = useState<Date>(startDateHours);
  const endDateHours = new Date();
  endDateHours.setHours(23);
  const [endDate, setEndDate] = useState<Date>(endDateHours);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<PosReport[] | undefined>(
    undefined
  );
  const [isFetching, setIsFetching] = useState(false);

  const [isNameFilter, setIsNameFilter] = useState(true);
  const [isProductFilter, setIsProductFilter] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const filterChoices = [
    {
      key: 1,
      title: "Name",
      current: isNameFilter,
    },
    {
      key: 2,
      title: "Products Bought",
      current: isProductFilter,
    },
  ];

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

  const formatDateString = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const computeTotalPrice = () => {
    let total = 0;
    const nullCheck = !filteredData ? salesReports : filteredData;
    const products: {
      product: {
        id: String;
        productName: String;
        stockPrice: number;
        sellPrice: number;
      };
      quantity: Number;
    }[] = [];
    nullCheck.forEach((item) => {
      item.productList.forEach((product) => products.push(product));
    });
    products.forEach(
      (item) => (total += item.product.sellPrice * (item.quantity as number))
    );
    return total;
  };

  const computeTotalProfit = () => {
    let total = 0;
    const nullCheck = !filteredData ? salesReports : filteredData;

    nullCheck.forEach((parentItem) => {
      parentItem.productList.forEach((item) => {
        total +=
          (item.product.sellPrice - item.product.stockPrice) *
          (item.quantity as number);
      });
      total -=
        (parentItem.otherExpense as number) +
        (parentItem.catTreatDiscount as number) +
        (parentItem.dogTreatDiscount as number);
    });
    return total;
  };

  const computeTotalDiscount = () => {
    let total = 0;
    const nullCheck = !filteredData ? salesReports : filteredData;

    nullCheck?.forEach((item) => (total += item.otherExpense as number));
    return total;
  };

  const computeTotalCatTreat = () => {
    let total = 0;
    const nullCheck = !filteredData ? salesReports : filteredData;
    nullCheck.forEach((item) => (total += item.catTreatDiscount as number));

    return total;
  };
  const computeTotalDogTreat = () => {
    let total = 0;
    const nullCheck = !filteredData ? salesReports : filteredData;
    nullCheck.forEach((item) => (total += item.dogTreatDiscount as number));

    return total;
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

  const filterData = (start: Date, end: Date, query: string) => {
    if (isNameFilter) {
      if (end && start) {
        end.setHours(23);
        start.setHours(0);
      }
      const filteredItems = salesReports.filter((item) => {
        const itemDate = item.date;
        const isDateInRange =
          (!start || itemDate >= start) && (!end || itemDate <= end);

        const isCustomerNameMatch = item.customer?.customerName
          .toLowerCase()
          .includes(query.toLowerCase());

        return isDateInRange && (!query || isCustomerNameMatch);
      });
      const sortedFilteredItems = filteredItems.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);

        return dateB.getTime() - dateA.getTime();
      });

      setFilteredData(sortedFilteredItems);
    } else if (isProductFilter) {
      if (end && start) {
        end.setHours(23);
        start.setHours(0);
      }
      const filteredItems = salesReports.filter((item) => {
        const itemDate = item.date;
        const isDateInRange =
          (!start || itemDate >= start) && (!end || itemDate <= end);

        const isProductMatch = item.productList.some((product) =>
          product.product.productName
            .toLowerCase()
            .includes(query.toLowerCase())
        );

        return isDateInRange && (!query || isProductMatch);
      });
      const sortedFilteredItems = filteredItems.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);

        return dateB.getTime() - dateA.getTime();
      });

      setFilteredData(sortedFilteredItems);
    }
  };
  console.log(isNameFilter);

  const chooseFilter = (key: number) => {
    switch (key) {
      case 1:
        setIsNameFilter(true);
        setIsProductFilter(false);
        break;
      case 2:
        setIsProductFilter(true);
        setIsNameFilter(false);
        break;
    }
  };
  useEffect(() => {
    if (!initialFetchSales) {
      readData();
      setInitialFetchSales(true);
      console.log("read");
    }
    filterData(startDate, endDate, searchQuery);
  }, [salesReports.length, salesReports]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#f7f7f7",
        opacity: isFilterModalVisible ? 0.2 : 1,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold", marginHorizontal: 10 }}>
        Fliter by name or date:
      </Text>
      <View>
        <View style={{ flexDirection: "row" }}>
          <SearchBar
            placeholder={
              isNameFilter ? "Customer name filter" : "Product bought filter"
            }
            containerStyle={{
              backgroundColor: "#f7f7f7",
              borderColor: "#f7f7f7",
              marginHorizontal: 10,
              flex: 1,
            }}
            inputContainerStyle={{
              backgroundColor: "#f7f2f7",
              borderRadius: 10,
            }}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              filterData(startDate!, endDate!, text);
            }}
          />
          <TouchableOpacity
            style={{
              alignSelf: "center",
              marginRight: wp("2%"),
              backgroundColor: "#f7f2f7",
              padding: wp("2%"),
              borderRadius: wp("3%"),
            }}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <AntDesign name="filter" size={24} color="#af71bd" />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <Button
            title={`${!startDate ? "Start Date" : formatDateString(startDate)}`}
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
          if (startDate && endDate) filterData(startDate, endDate, searchQuery);
        }}
      />
      {filteredData?.length !== 0 ? (
        <FlatList
          keyExtractor={(item) => item.id.toString()}
          style={{ marginTop: 5 }}
          data={!filteredData ? salesReports : filteredData}
          renderItem={({ item }) => (
            <View
              style={{
                flex: 1,
                paddingHorizontal: 10,
                paddingVertical: 10,
                borderColor: "#af71bd",
                borderWidth: 5,
                borderRadius: 5,
                marginVertical: 5,
                marginHorizontal: 10,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("SummaryCustomerReportScreen", {
                    ...item,
                    date:
                      item.date instanceof Date
                        ? item.date.toISOString()
                        : item.date,
                  })
                }
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      maxWidth: "70%",
                    }}
                  >
                    {item.customer?.customerName}
                  </Text>

                  <Text numberOfLines={1} style={{ maxWidth: "90%" }}>
                    {item.date instanceof Date
                      ? formatDateString(item.date)
                      : item.date}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Use search bar or date range filter to see data</Text>
        </View>
      )}

      <View
        style={{
          borderColor: "black",
          borderWidth: 2,
          marginHorizontal: 5,
          padding: 5,
        }}
      >
        <Text style={{ fontSize: 16 }}>
          Total price sold: ₱{computeTotalPrice().toFixed(2)}
        </Text>
        <Text style={{ fontSize: 16 }}>
          Total profit: ₱{computeTotalProfit().toFixed(2)}
        </Text>
        <Text style={{ fontSize: 16 }}>
          Total of discounts: ₱{computeTotalDiscount().toFixed(2)}
        </Text>
        <Text style={{ fontSize: 16 }}>
          Total of Dog Treat Discount: ₱{computeTotalDogTreat().toFixed(2)}
        </Text>
        <Text style={{ fontSize: 16 }}>
          Total of Cat Treat Discount: ₱{computeTotalCatTreat().toFixed(2)}
        </Text>
      </View>

      <Modal
        visible={isFilterModalVisible}
        transparent
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            alignSelf: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              height: hp("20%"),
              width: wp("70%"),
              borderRadius: wp("5%"),
            }}
          >
            <Text
              style={{
                marginTop: hp("2%"),
                marginHorizontal: wp("3%"),
                fontWeight: "bold",
                fontSize: hp("2%"),
                marginBottom: hp("2%"),
              }}
            >
              Search bar filters by:
            </Text>
            {filterChoices.map((item) => (
              <View
                key={item.key}
                style={{
                  marginHorizontal: wp("3%"),
                  marginVertical: hp("1%"),
                  borderBottomColor: "black",
                  borderBottomWidth: wp("0.2%"),
                }}
              >
                <TouchableOpacity
                  style={{ flexDirection: "row" }}
                  onPress={() => chooseFilter(item.key)}
                >
                  <Text style={{ flex: 1 }}>{item.title}</Text>
                  {item.current ? (
                    <AntDesign name="check" size={24} color="black" />
                  ) : null}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SalesReportScreen;

const styles = StyleSheet.create({});
