import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import Searchbar from "../../../components/Searchbar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import SalesReportList from "../../../components/SalesReportList";
import {
  PaymentMethodFilter,
  SalesReport,
  SalesReportListScreenProp,
  SalesReportSearchBarFilter,
} from "../../../types/type";
import DateTimePicker from "@react-native-community/datetimepicker";
import { onChangeDateRange } from "../../../methods/time-methods/onChangeDate";
import SalesReportView from "../../../components/SalesReportView";
import { filterSearchForSalesReport } from "../../../methods/search-filters/filterSearchForSalesReport";
import { useToastContext } from "../../../context/ToastContext";
import Toast from "react-native-toast-message";
import DateRangeSearch from "../../../components/DateRangeSearch";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FilterChoiceModalForSaleslist from "../../../components/FilterChoiceModalForSaleslist";
import { choices } from "../../../methods/search-filters/chooseFilterTypeForSaleslist";
import { useUserContext } from "../../../context/UserContext";
import { useKeyboardVisibilityListener } from "../../../hooks/useKeyboardVisibilityListener";
import { useGetSalesReport } from "../../../hooks/sales-report-hooks/useGetSalesReport";
import FileNameModal from "../../../components/FileNameModal";
import { salesReportsToExcel } from "../../../methods/convert-to-excel-methods/salesReportsToExcel";
import { useGetCustomers } from "../../../hooks/customer-hooks/useGetCustomers";
import { useCurrentSalesReportContext } from "../../../context/CurrentSalesReportContext";
import { useSalesreportCacheContext } from "../../../context/cacheContext/SalesReportCacheContext";
import { paymentMethodFilterChoices } from "../../../methods/search-filters/chooseFilterTypeWIthPaymentMethodForSaleslist";
import FilterChoiceByPaymentMethodModalForSaleslist from "../../../components/FilterChoiceByPaymentMethodModalForSaleslist";
import { filterSalesReportByPaymentMethod } from "../../../methods/search-filters/filterSalesReportByPaymentMethodForSalesReport";

const SalesReportListScreen = ({ navigation }: SalesReportListScreenProp) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isStartDatePickerVisible, setIsStartDatePickerVisible] =
    useState(false);
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToastContext();
  const { user } = useUserContext();

  const [salesReportSearchBarFilter, setSalesReportSearchBarFilter] =
    useState<SalesReportSearchBarFilter>("customer_name");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isFilterByPaymentModalVisible, setIsFilterByPaymentModalVisible] =
    useState(false);

  const { salesReports, setSalesReportList } = useGetSalesReport(
    setIsLoading,
    showToast,
    user
  );
  const { customers } = useGetCustomers(user, setIsLoading, showToast);
  const { isKeyboardVisible } = useKeyboardVisibilityListener();

  const [paymentMethodForFilter, setPaymentMethodForFilter] =
    useState<PaymentMethodFilter>("none");

  const [salesList, setSalesList] = useState<SalesReport[]>(salesReports);

  useEffect(
    () =>
      filterSalesReportByPaymentMethod(
        salesReports,
        paymentMethodForFilter,
        setSalesList
      ),
    [paymentMethodForFilter, salesReports]
  );

  const filteredData = filterSearchForSalesReport(
    salesList,
    searchQuery,
    salesReportSearchBarFilter
  );

  const [isFileModalVisible, setIsFileModalVisible] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isConversionLoading, setIsConversionLoading] = useState(false);

  const { setCurrentSalesReport } = useCurrentSalesReportContext();
  const { salesReportCache, setSalesReportCache } =
    useSalesreportCacheContext();

  return (
    <View
      style={[
        styles.container,
        {
          opacity:
            isFilterModalVisible ||
            isFileModalVisible ||
            isFilterByPaymentModalVisible
              ? 0.1
              : 1,
        },
      ]}
    >
      <View style={styles.headerContainer}>
        <Searchbar
          placeholder="Search a sales report..."
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
          setSearchBarValue={setSearchQuery}
          searchBarValue={searchQuery}
        />
        <TouchableOpacity
          onPress={() => setIsFilterModalVisible(true)}
          activeOpacity={0.7}
          style={styles.headerButtons}
        >
          <AntDesign name="filter" size={wp(7)} color="#634F40" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsFilterByPaymentModalVisible(true)}
          activeOpacity={0.7}
          style={styles.headerButtons}
        >
          <MaterialCommunityIcons
            name="credit-card-search-outline"
            size={wp(7)}
            color="#634F40"
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerButtons}
          onPress={() => {
            setIsFileModalVisible(true);
          }}
        >
          <MaterialCommunityIcons
            name="microsoft-excel"
            size={wp(7)}
            color="#634F40"
          />
        </TouchableOpacity>
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
        <SalesReportList
          data={filteredData}
          navigation={navigation}
          setCurrentSalesReport={setCurrentSalesReport}
        />
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
        salesReportSearchBarFilter={salesReportSearchBarFilter}
        setSalesReportSearchBarFilter={setSalesReportSearchBarFilter}
      />

      <FilterChoiceByPaymentMethodModalForSaleslist
        choices={paymentMethodFilterChoices}
        isFilterModalVisible={isFilterByPaymentModalVisible}
        setIsFilterModalVisible={setIsFilterByPaymentModalVisible}
        paymentMethodForFilter={paymentMethodForFilter}
        setPaymentMethodForFilter={setPaymentMethodForFilter}
      />

      {!isKeyboardVisible && <SalesReportView salesReportList={filteredData} />}
      <FileNameModal
        choiceKey={3}
        fileName={fileName}
        setFileName={setFileName}
        conversionLoading={isConversionLoading}
        isFileNameVisible={isFileModalVisible}
        onFileModalClose={() => {
          setIsFileModalVisible(false);
          setFileName("");
        }}
        confirmFn={async () => {
          setIsConversionLoading(true);
          setTimeout(async () => {
            await salesReportsToExcel(
              customers,
              salesReports,
              startDate,
              endDate,
              fileName,
              showToast,
              setIsConversionLoading,
              setIsFileModalVisible,
              salesReportCache,
              setSalesReportCache
            );
            setFileName("");
          }, 100);
        }}
      />
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
  titleStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(3.5),
  },
  messageStyle: {
    fontFamily: "SoraBold",
    fontSize: wp(4.5),
    textAlign: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: wp(25),
  },
  headerButtons: {
    paddingHorizontal: wp(1),
  },
});
