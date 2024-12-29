import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Searchbar from "../../../components/Searchbar";
import DateTimePicker from "@react-native-community/datetimepicker";
import { onChangeDateRange } from "../../../methods/time-methods/onChangeDate";
import StockReportList from "../../../components/StockReportList";
import { useProductContext } from "../../../context/ProductContext";
import { filterSearchForPoduct } from "../../../methods/search-filters/filterSearchForProduct";
import Toast from "react-native-toast-message";
import { useToastContext } from "../../../context/ToastContext";
import CurrentStockTotalVIew from "../../../components/CurrentStockTotalVIew";
import DateRangeSearch from "../../../components/DateRangeSearch";
import { useUserContext } from "../../../context/UserContext";
import { useKeyboardVisibilityListener } from "../../../hooks/useKeyboardVisibilityListener";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { stockSoldReportToExcel } from "../../../methods/convert-to-excel-methods/stockSoldReportsToExcel";
import { useGetSalesReport } from "../../../hooks/sales-report-hooks/useGetSalesReport";
import FileNameModal from "../../../components/FileNameModal";
import ConversionOptionsModal from "../../../components/ConversionOptionsModal";
import { productStockReportToExcel } from "../../../methods/convert-to-excel-methods/productStockReportToExcel";
import { choiceType } from "../../../types/type";
import { useStockSoldReportCacheContext } from "../../../context/cacheContext/StockSoldReportCacheContext";

const StockReportScreen = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isStartDatePickerVisible, setIsStartDatePickerVisible] =
    useState(false);
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { products } = useProductContext();

  const { showToast } = useToastContext();

  const filteredData = filterSearchForPoduct(products, searchQuery);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserContext();

  const { isKeyboardVisible } = useKeyboardVisibilityListener();

  const { salesReports, setSalesReportList } = useGetSalesReport(
    setIsLoading,
    showToast,
    user
  );

  const [isFileModalVisible, setIsFileModalVisible] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isConversionOptionsVisible, setIsConversionOptionsVisible] =
    useState(false);

  const choices: choiceType[] = [
    {
      key: 1,
      choiceName: "Convert stock sold to Excel",
    },
    {
      key: 2,
      choiceName: "Convert products to Excel",
    },
  ];

  const [choiceSelected, setChoiceSelected] = useState<choiceType | null>(null);
  const [isConversionLoading, setIsConversionLoading] = useState(false);

  const { stockSoldCache, setStockSoldCache } =
    useStockSoldReportCacheContext();

  return (
    <View
      style={[
        styles.container,
        { opacity: isFileModalVisible || isConversionOptionsVisible ? 0.1 : 1 },
      ]}
    >
      <View style={styles.headerContainer}>
        <Searchbar
          placeholder="Search a product..."
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
          setSearchBarValue={setSearchQuery}
          searchBarValue={searchQuery}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerButtons}
          onPress={() => setIsConversionOptionsVisible(true)}
        >
          <MaterialCommunityIcons
            name="microsoft-excel"
            size={26}
            color="#634F40"
          />
        </TouchableOpacity>
      </View>

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
      <ConversionOptionsModal
        choices={choices}
        isConversionOptionsVisible={isConversionOptionsVisible}
        setIsConversionOptionsVisible={setIsConversionOptionsVisible}
        setSelectedChoice={setChoiceSelected}
        setIsFileNameVisible={setIsFileModalVisible}
      />

      <Toast position="bottom" autoHide visibilityTime={2000} />
      <FileNameModal
        isFileNameVisible={isFileModalVisible}
        fileName={fileName}
        setFileName={setFileName}
        confirmFn={async () => {
          setIsConversionLoading(true);
          setTimeout(async () => {
            switch (choiceSelected?.key) {
              case 1:
                await stockSoldReportToExcel(
                  products,
                  salesReports,
                  startDate,
                  endDate,
                  fileName,
                  showToast,
                  setIsConversionLoading,
                  setIsFileModalVisible,
                  setIsConversionOptionsVisible,
                  setChoiceSelected,
                  stockSoldCache,
                  setStockSoldCache
                );
                break;
              case 2:
                await productStockReportToExcel(
                  products,
                  fileName,
                  showToast,
                  setIsConversionLoading,
                  setIsFileModalVisible,
                  setIsConversionOptionsVisible,
                  setChoiceSelected
                );
                break;
            }
            setFileName("");
          }, 100);
        }}
        choiceKey={choiceSelected?.key!}
        conversionLoading={isConversionLoading}
        onFileModalClose={() => {
          setIsConversionOptionsVisible(true);
          setIsFileModalVisible(false);
          setFileName("");
        }}
      />
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: wp(10),
  },
  headerButtons: {
    paddingLeft: wp(2),
  },
});
