import { Keyboard, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Searchbar from "../../../components/Searchbar";
import DateTimePicker from "@react-native-community/datetimepicker";
import { onChangeDateRange } from "../../../methods/time-methods/onChangeDate";
import StockReportList from "../../../components/StockReportList";
import { useProductContext } from "../../../context/ProductContext";
import { useSalesReportContext } from "../../../context/SalesReportContext";
import { filterSearchForPoduct } from "../../../methods/search-filters/filterSearchForProduct";
import Toast from "react-native-toast-message";
import { useToastContext } from "../../../context/ToastContext";
import CurrentStockTotalVIew from "../../../components/CurrentStockTotalVIew";
import DateRangeSearch from "../../../components/DateRangeSearch";
import { useUserContext } from "../../../context/UserContext";
import { useKeyboardVisibilityListener } from "../../../hooks/useKeyboardVisibilityListener";

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
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserContext();

  const { isKeyboardVisible } = useKeyboardVisibilityListener();

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search a product..."
        onChangeText={(text) => setSearchQuery(text)}
        value={searchQuery}
        setSearchBarValue={setSearchQuery}
        searchBarValue={searchQuery}
      />
      <DateRangeSearch
        startDate={startDate}
        endDate={endDate}
        setIsEndDatePickerVisible={setIsEndDatePickerVisible}
        setIsStartDatePickerVisible={setIsStartDatePickerVisible}
        setSalesReportList={setSalesReportList}
        showToast={showToast}
        setIsLoading={setIsLoading}
        loading={isLoading}
        user={user}
      />
      <StockReportList data={filteredData} salesReport={salesReports} />
      <Toast position="bottom" autoHide visibilityTime={2000} />

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
      {!isKeyboardVisible && <CurrentStockTotalVIew products={products} />}
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
