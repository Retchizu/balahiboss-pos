import { Keyboard, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import Searchbar from "../../components/Searchbar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Button } from "@rneui/base";
import SalesReportList from "../../components/SalesReportList";
import { useSalesReportContext } from "../../context/SalesReportContext";
import { SalesReportListScreenProp } from "../../types/type";
import { readableDate } from "../../methods/time-methods/readableDate";
import DateTimePicker from "@react-native-community/datetimepicker";
import { onChangeDateRange } from "../../methods/time-methods/onChangeDate";
import { getSalesReportData } from "../../methods/data-methods/getSalesReportData";
import SalesReportView from "../../components/SalesReportView";
import { filterSearchForSalesReport } from "../../methods/search-filters/filterSearchForSalesReport";

const SalesReportListScreen = ({ navigation }: SalesReportListScreenProp) => {
  const { salesReports, setSalesReportList } = useSalesReportContext();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isStartDatePickerVisible, setIsStartDatePickerVisible] =
    useState(false);
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredData = filterSearchForSalesReport(salesReports, searchQuery);
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search a sales report..."
        onChangeText={(text) => setSearchQuery(text)}
        value={searchQuery}
      />
      <View style={styles.buttonContainer}>
        <Button
          buttonStyle={styles.buttonStyle}
          title={startDate ? readableDate(startDate) : "Start Date"}
          titleStyle={styles.titleStyle}
          onPress={() => setIsStartDatePickerVisible(true)}
        />
        <Text> -- </Text>
        <Button
          buttonStyle={styles.buttonStyle}
          title={endDate ? readableDate(endDate) : "End Date"}
          titleStyle={styles.titleStyle}
          onPress={() => setIsEndDatePickerVisible(true)}
        />
      </View>
      <Button
        buttonStyle={styles.buttonStyle}
        title={"Confirm Date"}
        titleStyle={styles.titleStyle}
        onPress={() =>
          startDate &&
          endDate &&
          getSalesReportData(startDate, endDate, setSalesReportList)
        }
      />
      <SalesReportList data={filteredData} navigation={navigation} />
      {isStartDatePickerVisible && (
        <DateTimePicker
          value={startDate ? startDate : new Date()}
          mode="date"
          onChange={onChangeDateRange(
            setIsStartDatePickerVisible,
            setStartDate
          )}
        />
      )}
      {isEndDatePickerVisible && (
        <DateTimePicker
          value={endDate ? endDate : new Date()}
          mode="date"
          onChange={onChangeDateRange(setIsEndDatePickerVisible, setEndDate)}
        />
      )}
      {!isKeyboardVisible && <SalesReportView salesReportList={filteredData} />}
    </View>
  );
};

export default SalesReportListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0E9",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
  },
  buttonStyle: {
    backgroundColor: "#E6B794",
    borderRadius: wp(1.5),
  },
  titleStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(3.5),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: hp(1),
  },
});
