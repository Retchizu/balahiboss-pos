import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Button } from "@rneui/base";
import Searchbar from "../../../components/Searchbar";
import { readableDate } from "../../../methods/time-methods/readableDate";
import DateTimePicker from "@react-native-community/datetimepicker";
import { onChangeDateRange } from "../../../methods/time-methods/onChangeDate";
import StockReportList from "../../../components/StockReportList";
import { useProductContext } from "../../../context/ProductContext";
import { useSalesReportContext } from "../../../context/SalesReportContext";
import { getSalesReportData } from "../../../methods/data-methods/getSalesReportData";
import { filterSearchForPoduct } from "../../../methods/search-filters/filterSearchForProduct";
import Toast from "react-native-toast-message";
import { useToastContext } from "../../../context/ToastContext";

const StockReportScreen = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isStartDatePickerVisible, setIsStartDatePickerVisible] =
    useState(false);
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { products } = useProductContext();
  const { salesReports, setSalesReportList } = useSalesReportContext();
  const { showToast } = useToastContext();

  const filteredData = filterSearchForPoduct(products, searchQuery);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search a product..."
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
        onPress={() => {
          if (startDate && endDate)
            getSalesReportData(startDate, endDate, setSalesReportList);
          else showToast("error", "Date range incomplete");
        }}
      />
      <StockReportList data={filteredData} salesReport={salesReports} />

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
      <Toast position="bottom" autoHide visibilityTime={2000} />
    </View>
  );
};

export default StockReportScreen;

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
