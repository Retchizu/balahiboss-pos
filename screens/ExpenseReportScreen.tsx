import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ExpenseReport, ExpenseRootStackParamList } from "../type";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, SearchBar } from "@rneui/base";
import { useExpenseReportContext } from "../context/expenseReportContext";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { auth, db } from "../firebaseconfig";
import Toast from "react-native-simple-toast";
import { useFocusEffect } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type Props = NativeStackScreenProps<
  ExpenseRootStackParamList,
  "ExpenseReportScreen"
>;

const convertTimestampToDate = (
  timestamp: firebase.firestore.Timestamp
): Date => {
  const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6;
  return new Date(milliseconds);
};

const ExpenseReportScreen = ({ navigation }: Props) => {
  const startDateHours = new Date();
  startDateHours.setHours(0);
  const [startDate, setStartDate] = useState<Date>(startDateHours);
  const endDateHours = new Date();
  endDateHours.setHours(23);
  const [endDate, setEndDate] = useState<Date>(endDateHours);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<ExpenseReport[] | undefined>(
    undefined
  );
  const { expenseList, setExpense } = useExpenseReportContext();
  const [initialRead, setInitialRead] = useState(false);
  const [floatingButtonOpacity, setFloatingButtonOpacity] = useState(1);
  const [isFetching, setIsFetching] = useState(false);

  const readData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        setIsFetching(true);
        const fetched: ExpenseReport[] = [];
        const startDateTimestamp =
          firebase.firestore.Timestamp.fromDate(startDate);
        const endDateTimestamp = firebase.firestore.Timestamp.fromDate(endDate);
        const docRef = db
          .collection("users")
          .doc(user.uid)
          .collection("expense")
          .where("expenseDate", ">=", startDateTimestamp)
          .where("expenseDate", "<=", endDateTimestamp)
          .orderBy("expenseDate", "desc");
        const querySnapshot = await docRef.get();
        querySnapshot.forEach((doc) => {
          const { expenseTitle, expenseDescription, expenseDate, expenseCost } =
            doc.data();

          const expenseData: ExpenseReport = {
            id: doc.id,
            expenseTitle,
            expenseDescription,
            expenseDate: convertTimestampToDate(expenseDate),
            expenseCost,
          };
          fetched.push(expenseData);
        });
        setExpense(fetched);
        setIsFetching(false);
      }
    } catch (error) {
      Toast.show("Error getting data", Toast.SHORT);
    }
  };
  const filterData = (start: Date, end: Date, query: string) => {
    if (end && start) {
      end.setHours(23);
      start.setHours(0);
    }
    const filteredItems = expenseList.filter((item) => {
      const itemDate = item.expenseDate;
      const isDateInRange =
        (!start || itemDate >= start) && (!end || itemDate <= end);

      const isTitleMatch = item.expenseTitle
        .toLowerCase()
        .includes(query.toLowerCase());

      return isDateInRange && (!query || isTitleMatch);
    });
    const sortedFilteredItems = filteredItems.sort((a, b) => {
      const dateA =
        a.expenseDate instanceof Date ? a.expenseDate : new Date(a.expenseDate);
      const dateB =
        b.expenseDate instanceof Date ? b.expenseDate : new Date(b.expenseDate);

      return dateB.getTime() - dateA.getTime();
    });

    setFilteredData(sortedFilteredItems);
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
  const computeTotalExpense = () => {
    let total = 0;
    const nullCheck = !filteredData ? expenseList : filteredData;
    nullCheck.forEach((item) => (total += item.expenseCost as number));
    return total;
  };
  useEffect(() => {
    if (!initialRead) {
      readData();
      setInitialRead(true);
    }
    filterData(startDate, endDate, searchQuery);
  }, [expenseList.length]);

  console.log(expenseList);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginHorizontal: 10 }}>
        Fliter by name or date:
      </Text>
      <View>
        <SearchBar
          placeholder="Expense title filter"
          containerStyle={{
            backgroundColor: "#f7f7f7",
            borderColor: "#f7f7f7",
            marginHorizontal: 10,
          }}
          inputContainerStyle={{ backgroundColor: "#f7f2f7", borderRadius: 10 }}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            filterData(startDate!, endDate!, text);
          }}
        />
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
          onScroll={() => setFloatingButtonOpacity(0.1)}
          onScrollEndDrag={() => setFloatingButtonOpacity(1)}
          data={!filteredData ? expenseList : filteredData}
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
                  navigation.navigate("ViewExpenseSummaryScreen", {
                    ...item,
                    expenseDate:
                      item.expenseDate instanceof Date
                        ? item.expenseDate.toISOString()
                        : item.expenseDate,
                  })
                }
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    {item.expenseTitle}
                  </Text>

                  <Text numberOfLines={1} style={{ maxWidth: "90%" }}>
                    {item.expenseDate instanceof Date
                      ? formatDateString(item.expenseDate)
                      : item.expenseDate}
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

      <TouchableOpacity
        onPress={() => navigation.navigate("AddExpenseScreen")}
        style={{
          position: "absolute",
          right: wp("5%"),
          bottom: hp("6%"),
          opacity: floatingButtonOpacity,
        }}
      >
        <MaterialIcons
          name="post-add"
          size={30}
          color="white"
          style={{ backgroundColor: "#af71bd", padding: 6, borderRadius: 22 }}
        />
      </TouchableOpacity>
      <View
        style={{
          borderColor: "black",
          borderWidth: 2,
          marginHorizontal: 5,
          padding: 5,
        }}
      >
        <Text style={{ fontSize: 16 }}>
          Total Expense: ₱{computeTotalExpense().toFixed(2)}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default ExpenseReportScreen;

const styles = StyleSheet.create({});
