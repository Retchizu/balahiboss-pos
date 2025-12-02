import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useMemo, useState } from "react";
import useProductsArray from "@/hooks/useProductsArray";
import searchProductsByName from "@/methods/search/searchProductsByName";
import { primary, secondary, strongPrimary } from "@/theme/backgroundTheme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import SearchBar from "@/components/searchbars/SearchBar";
import { useTransactionContext } from "@/contexts/TransactionContext";
import Transaction from "@/types/Transaction";
import DatePicker from "react-native-date-picker";
import CommonButton from "@/components/buttons/CommonButton";
import Toast from "react-native-toast-message";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ModalTemplate from "@/components/modals/ModalTemplate";
import { Entypo } from "@expo/vector-icons";
import Input from "@/components/inputs/Input";
import { Checkbox } from "expo-checkbox";
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useProductContext } from "@/contexts/ProductContext";

const StockReportListScreen = () => {
  const { products } = useProductContext();
  const { productsArray } = useProductsArray(products);
  const { transactions, startDate, endDate, setStartDate, setEndDate } =
    useTransactionContext();
  // search bar
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return searchProductsByName(productsArray, searchQuery);
  }, [productsArray, searchQuery]);

  const productTotalStockSold = useMemo(() => {
    return calculateTotalStockSold(transactions);
  }, [transactions]);

  // date range
  // startDate
  const [isStartDatePickerVisible, setIsStartDatePickerVisible] =
    useState(false);

  // endDate
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);

  // excel conversion
  const [excelConversionOptionsModal, setExcelConversionOptionsModal] =
    useState(false);
  const [excelFileName, setExcelFileName] = useState("");

  const [selectedOption, setSelectedOption] = useState<
    "products" | "stockSold" | null
  >(null);

  const stockSoldExportData = useMemo(() => {
    const totalSold = calculateTotalStockSold(transactions);

    return productsArray
      .filter((product) => product.deleted !== true)
      .map((product) => ({
        "Product Name": product.productName,
        "Total Stock Sold": totalSold[product.id] || 0,
      }));
  }, [productsArray, transactions]);

  const productsExportData = useMemo(() => {
    return productsArray
      .filter((product) => product.deleted !== true)
      .map((product) => ({
        "Product Name": product.productName,
        Stock: product.stock,
        "Stock Price": product.stockPrice,
        "Sell Price": product.sellPrice,
        "Current Stock Total Amount": product.stockPrice * product.stock,
      }));
  }, [productsArray]);

  const exportToExcel = async (data: any[], fileName: string) => {
    if (excelFileName.length === 0 || selectedOption === null) {
      Toast.show({ type: "error", text1: "File name and mode is required." });
      return;
    }
    if (!data || data.length === 0) {
      console.warn("No data to export");
      return;
    }

    try {
      // Create worksheet and set column widths
      const worksheet = XLSX.utils.json_to_sheet(data);
      worksheet["!cols"] = [
        { wch: 40 }, // Product Name
        { wch: 10 }, // Stock / Sold
        { wch: 12 }, // Stock Price
        { wch: 12 }, // Sell Price
        { wch: 28 }, // Current Stock Total Amount
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // Convert workbook to base64
      const workbookOutput = XLSX.write(workbook, {
        type: "base64",
        bookType: "xlsx",
      });

      // Save to device storage
      const fileUri = `${FileSystem.documentDirectory}${fileName}.xlsx`;
      await FileSystem.writeAsStringAsync(fileUri, workbookOutput, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Share if available
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: `Share ${fileName}.xlsx`,
        });
      }

      Toast.show({ type: "success", text1: "Export successful" });
      console.log("Exported Excel:", fileUri);
    } catch (error) {
      Toast.show({ type: "error", text1: "Something went wrong" });
      console.log("Excel Export Error:", error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(2),
      }}
    >
      <View style={{ flexDirection: "row", gap: wp(2) }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={"Search Products..."}
          row
        />

        <TouchableOpacity
          style={{
            padding: wp(2),
            borderRadius: wp(4),
            backgroundColor: secondary,
          }}
          onPress={() => setExcelConversionOptionsModal(true)}
        >
          <MaterialCommunityIcons
            name="microsoft-excel"
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <View
        style={{ flexDirection: "row", justifyContent: "center", gap: wp(10) }}
      >
        <CommonButton
          onPress={() => {
            setIsStartDatePickerVisible(true);
          }}
          title={
            startDate
              ? startDate.toLocaleString("en-PH", {
                  dateStyle: "medium",
                })
              : "Start Date"
          }
          backgroundColor={strongPrimary}
          titleColor={"#9A3412"}
          marginTop={hp(1)}
          iconLeft={{
            family: "AntDesign",
            name: "calendar",
            color: "#9A3412",
            size: wp(5.5),
          }}
        />
        <CommonButton
          onPress={() => {
            setIsEndDatePickerVisible(true);
          }}
          title={
            endDate
              ? endDate.toLocaleString("en-PH", {
                  dateStyle: "medium",
                })
              : "End Date"
          }
          backgroundColor={strongPrimary}
          titleColor={"#9A3412"}
          marginTop={hp(1)}
          iconLeft={{
            family: "AntDesign",
            name: "calendar",
            color: "#9A3412",
            size: wp(5.5),
          }}
        />
      </View>
      {
        // start date picker
      }
      <DatePicker
        modal
        open={isStartDatePickerVisible}
        date={startDate ?? new Date()}
        mode="date"
        onConfirm={(selectedDate) => {
          setIsStartDatePickerVisible(false);
          selectedDate.setHours(0, 0, 0, 0);
          setStartDate(selectedDate);
        }}
        onCancel={() => setIsStartDatePickerVisible(false)}
      />
      {
        // end date picker
      }
      <DatePicker
        modal
        open={isEndDatePickerVisible}
        date={endDate ?? new Date()}
        mode="date"
        onConfirm={(selectedDate) => {
          setIsEndDatePickerVisible(false);
          selectedDate.setHours(11, 59, 59, 999);
          setEndDate(selectedDate);
        }}
        onCancel={() => setIsEndDatePickerVisible(false)}
      />

      <View style={{ flexDirection: "row", marginTop: hp(1) }}>
        <Text style={[styles.labelStyle, { width: wp(55) }]}>Product</Text>
        <Text
          style={[styles.labelStyle, { width: wp(20), textAlign: "center" }]}
        >
          Current Stock
        </Text>
        <Text
          style={[styles.labelStyle, { width: wp(20), textAlign: "center" }]}
        >
          Stock Sold
        </Text>
      </View>
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <View
            style={{
              borderColor: strongPrimary,
              borderBottomWidth: wp(0.2),
              paddingVertical: wp(1),
              flexDirection: "row",
            }}
          >
            <Text style={[styles.valueStyle, { width: wp(55) }]}>
              {item.productName}
            </Text>
            <Text
              style={[
                styles.valueStyle,
                { width: wp(20), color: "#60B5FF", textAlign: "center" },
              ]}
            >
              {item.stock}
            </Text>
            <Text
              style={[
                styles.valueStyle,
                { width: wp(20), textAlign: "center" },
              ]}
            >
              {productTotalStockSold[item.id] || 0}
            </Text>
          </View>
        )}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
      <ModalTemplate
        visible={excelConversionOptionsModal}
        onClose={() => {
          setExcelConversionOptionsModal(false);
        }}
        width={wp(80)}
        height={hp(48)}
      >
        <View style={{ alignItems: "center", marginBottom: hp(1.2) }}>
          <Entypo
            name="documents"
            size={wp(14)}
            color="#107C10"
            style={{ marginBottom: hp(0.8) }}
          />
          <Text
            style={{
              fontFamily: "Gantari-Bold",
              fontSize: wp(4.6),
              textAlign: "center",
            }}
          >
            Export to Excel
          </Text>
          <Text
            style={{
              fontFamily: "Gantari-Regular",
              fontSize: wp(3.6),
              color: "#6B7280",
              textAlign: "center",
              marginTop: hp(0.4),
            }}
          >
            Choose a file name and export mode.
          </Text>
        </View>

        <View style={{ paddingHorizontal: wp(2) }}>
          <Input
            value={excelFileName}
            onChangeText={setExcelFileName}
            placeholder="File Name"
          />

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: hp(2),
              padding: wp(3),
              borderRadius: wp(2),
              borderWidth: 1,
              borderColor:
                selectedOption === "products" ? "#D1FAE5" : "transparent",
              backgroundColor:
                selectedOption === "products" ? "#ECFDF5" : "transparent",
            }}
            activeOpacity={0.8}
            onPress={() => setSelectedOption("products")}
          >
            <Checkbox
              value={selectedOption === "products"}
              onValueChange={() => setSelectedOption("products")}
              color={selectedOption === "products" ? "#107C10" : undefined}
            />
            <Text style={[styles.optionText, { marginLeft: wp(3) }]}>
              Products to Excel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: hp(1),
              padding: wp(3),
              borderRadius: wp(2),
              borderWidth: 1,
              borderColor:
                selectedOption === "stockSold" ? "#DBEAFE" : "transparent",
              backgroundColor:
                selectedOption === "stockSold" ? "#EFF6FF" : "transparent",
            }}
            activeOpacity={0.8}
            onPress={() => setSelectedOption("stockSold")}
          >
            <Checkbox
              value={selectedOption === "stockSold"}
              onValueChange={() => setSelectedOption("stockSold")}
              color={selectedOption === "stockSold" ? "#2563EB" : undefined}
            />
            <Text style={[styles.optionText, { marginLeft: wp(3) }]}>
              Stock Sold to Excel
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            marginTop: hp(3),
            paddingHorizontal: wp(2),
            flexDirection: "row",
            justifyContent: "space-between",
            gap: wp(3),
          }}
        >
          <CommonButton
            title="Cancel"
            onPress={() => {
              setSelectedOption(null);
              setExcelConversionOptionsModal(false);
              setExcelFileName("");
            }}
            backgroundColor="#F3F4F6"
            titleColor="#111827"
            marginTop={0}
          />
          <CommonButton
            title="Export"
            onPress={async () => {
              if (selectedOption === "products") {
                await exportToExcel(productsExportData, excelFileName);
              } else if (selectedOption === "stockSold") {
                await exportToExcel(stockSoldExportData, excelFileName);
              }
            }}
            backgroundColor={strongPrimary}
            titleColor="#ffffff"
            marginTop={0}
          />
        </View>
      </ModalTemplate>
    </View>
  );
};

export default StockReportListScreen;

const styles = StyleSheet.create({
  valueStyle: {
    fontFamily: "Gantari-Regular",
    fontSize: wp(3.5),
  },
  labelStyle: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(4),
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(2),
  },
  optionText: {
    marginLeft: wp(2),
    fontSize: wp(4),
  },
  actions: {
    flexDirection: "row",
    marginTop: hp(2),
    gap: wp(4),
    justifyContent: "flex-end",
  },
});

const calculateTotalStockSold = (
  transactions: Transaction[]
): Record<string, number> => {
  const total = transactions.reduce<Record<string, number>>((acc, t) => {
    t.items.forEach((item) => {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
    });
    return acc;
  }, {});

  return total;
};
