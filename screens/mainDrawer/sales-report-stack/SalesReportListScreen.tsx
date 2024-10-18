import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  View,
  Text,
} from "react-native";
import React, { useEffect, useState } from "react";
import Searchbar from "../../../components/Searchbar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import SalesReportList from "../../../components/SalesReportList";
import { useSalesReportContext } from "../../../context/SalesReportContext";
import { SalesReportListScreenProp } from "../../../types/type";
import DateTimePicker from "@react-native-community/datetimepicker";
import { onChangeDateRange } from "../../../methods/time-methods/onChangeDate";
import { getSalesReportData } from "../../../methods/data-methods/getSalesReportData";
import SalesReportView from "../../../components/SalesReportView";
import { filterSearchForSalesReport } from "../../../methods/search-filters/filterSearchForSalesReport";
import { useToastContext } from "../../../context/ToastContext";
import Toast from "react-native-toast-message";
import DateRangeSearch from "../../../components/DateRangeSearch";
import { Button } from "@rneui/base";
import AntDesign from "@expo/vector-icons/AntDesign";
import FilterChoiceModalForSaleslist from "../../../components/FilterChoiceModalForSaleslist";
import { choices } from "../../../methods/search-filters/chooseFilterTypeForSaleslist";
import { useUserContext } from "../../../context/UserContext";

const SalesReportListScreen = ({ navigation }: SalesReportListScreenProp) => {
  const { salesReports, setSalesReportList } = useSalesReportContext();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isStartDatePickerVisible, setIsStartDatePickerVisible] =
    useState(false);
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToastContext();
  const { user } = useUserContext();

  const [isNameFilter, setIsNameFilter] = useState(true);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  useEffect(() => {
    getSalesReportData(
      new Date(),
      new Date(),
      setSalesReportList,
      setIsLoading,
      showToast,
      user
    );
  }, []);

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

  const filteredData = filterSearchForSalesReport(
    salesReports,
    searchQuery,
    isNameFilter
  );
  return (
    <View
      style={[styles.container, { opacity: isFilterModalVisible ? 0.1 : 1 }]}
    >
      <View style={styles.headerContainer}>
        <Searchbar
          placeholder="Search a sales report..."
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
          setSearchBarValue={setSearchQuery}
          searchBarValue={searchQuery}
        />
        <Button
          buttonStyle={[styles.buttonStyle, { backgroundColor: "#F3F0E9" }]}
          icon={<AntDesign name="filter" size={24} color="#634F40" />}
          containerStyle={{ paddingHorizontal: wp(1) }}
          onPress={() => setIsFilterModalVisible(true)}
        />
      </View>

      <DateRangeSearch
        endDate={endDate}
        startDate={startDate}
        setIsEndDatePickerVisible={setIsEndDatePickerVisible}
        setIsStartDatePickerVisible={setIsStartDatePickerVisible}
        setSalesReportList={setSalesReportList}
        showToast={showToast}
        setIsLoading={setIsLoading}
        user={user}
        loading={isLoading}
      />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator color={"#634F40"} size={wp(10)} />
        </View>
      ) : filteredData.length ? (
        <SalesReportList data={filteredData} navigation={navigation} />
      ) : (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.messageStyle}>No sales found at this time.</Text>
        </View>
      )}

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
      <FilterChoiceModalForSaleslist
        choices={choices}
        isFilterModalVisible={isFilterModalVisible}
        setIsFilterModalVisible={setIsFilterModalVisible}
        isNameFilter={isNameFilter}
        setIsNameFilter={setIsNameFilter}
      />
      {!isKeyboardVisible && <SalesReportView salesReportList={filteredData} />}
      <Toast position="bottom" autoHide visibilityTime={2000} />
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
  messageStyle: {
    fontFamily: "SoraBold",
    fontSize: wp(4.5),
    textAlign: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: wp(10),
  },
});
