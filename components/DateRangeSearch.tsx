import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Button } from "@rneui/base";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { readableDate } from "../methods/time-methods/readableDate";
import { getSalesReportData } from "../methods/data-methods/getSalesReportData";
import { SalesReport } from "../types/type";
import { ToastType } from "react-native-toast-message";

type DateRangeSearchProp = {
  startDate: Date | null;
  endDate: Date | null;
  setIsStartDatePickerVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEndDatePickerVisible: React.Dispatch<React.SetStateAction<boolean>>;
  showToast: (type: ToastType, text1: string, text2?: string) => void;
  setSalesReportList: (newSalesReportList: SalesReport[]) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const DateRangeSearch = ({
  startDate,
  endDate,
  setIsStartDatePickerVisible,
  setIsEndDatePickerVisible,
  showToast,
  setSalesReportList,
  setIsLoading,
}: DateRangeSearchProp) => {
  return (
    <View>
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
            getSalesReportData(
              startDate,
              endDate,
              setSalesReportList,
              setIsLoading,
              showToast
            );
          else showToast("error", "Date range incomplete");
        }}
      />
    </View>
  );
};

export default DateRangeSearch;

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: hp(1),
  },
  buttonStyle: {
    backgroundColor: "#E6B794",
    borderRadius: wp(1.5),
  },
  titleStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(3.5),
  },
});
