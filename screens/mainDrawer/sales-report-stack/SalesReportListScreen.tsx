import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import Searchbar from "../../../components/Searchbar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import SalesReportList from "../../../components/SalesReportList";
import { SalesReportListScreenProp } from "../../../types/type";
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

  const [isNameFilter, setIsNameFilter] = useState(true);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const { salesReports, setSalesReportList } = useGetSalesReport(
    setIsLoading,
    showToast,
    user
  );
  const { customers } = useGetCustomers(user, setIsLoading, showToast);
  const { isKeyboardVisible } = useKeyboardVisibilityListener();
  const filteredData = filterSearchForSalesReport(
    salesReports,
    searchQuery,
    isNameFilter
  );

  const [isFileModalVisible, setIsFileModalVisible] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isConversionLoading, setIsConversionLoading] = useState(false);

  return (
    <View
      style={[
        styles.container,
        { opacity: isFilterModalVisible || isFileModalVisible ? 0.1 : 1 },
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
          <AntDesign name="filter" size={26} color="#634F40" />
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
            size={26}
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
              setIsFileModalVisible
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
    paddingRight: wp(15),
  },
  headerButtons: {
    paddingHorizontal: wp(1),
  },
});
