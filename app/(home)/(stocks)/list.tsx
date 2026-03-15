import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useProductsArray from "@/hooks/useProductsArray";
import searchProductsByName from "@/methods/search/searchProductsByName";
import { useTheme } from "@/contexts/ThemeContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import SearchBar from "@/components/searchbars/SearchBar";
import { useTransactionContext } from "@/contexts/TransactionContext";
import Transaction from "@/types/Transaction";
import DateRangePickerModal from "@/components/modals/DateRangePickerModal";
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
import { api } from "@/config/axios-api";
import { isAxiosError } from "axios";
import { format } from "date-fns";

const StockReportListScreen = () => {
  const { primary, secondary, strongPrimary, textOnPrimary, textOnSecondary, textMuted, textOnStrongPrimary} =
    useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        valueStyle: {
          fontFamily: "Gantari-Regular",
          fontSize: wp(3.5),
          color: textOnPrimary,
        },
        labelStyle: {
          fontFamily: "Gantari-SemiBold",
          fontSize: wp(4),
          color: textOnPrimary,
        },
        optionRow: {
          flexDirection: "row",
          alignItems: "center",
          marginTop: hp(2),
        },
        optionText: {
          marginLeft: wp(2),
          fontSize: wp(4),
          color: textOnPrimary,
        },
        actions: {
          flexDirection: "row",
          marginTop: hp(2),
          gap: wp(4),
          justifyContent: "flex-end",
        },
      }),
    [textOnPrimary]
  );

  const { products } = useProductContext();
  const { productsArray } = useProductsArray(products);
  const { transactions, setTransactions, startDate, endDate, setStartDate, setEndDate } =
    useTransactionContext();
  const [loading, setLoading] = useState(false);
  // search bar
  const [searchQuery, setSearchQuery] = useState("");

  const getTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/transactions", {
        params: {
          startDate,
          endDate,
        },
      });
      setTransactions(response.data.items);
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({
          type: "error",
          text1: `${error.response?.data.error}`,
        });
      }
      console.error("Get Transaction Failed: ", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, setTransactions]);

  useEffect(() => {
    getTransactions()
  }, [getTransactions])
  const filteredProducts = useMemo(() => {
    return searchProductsByName(productsArray, searchQuery);
  }, [productsArray, searchQuery]);

  const productTotalStockSold = useMemo(() => {
    return calculateTotalStockSold(transactions);
  }, [transactions]);

  // date range picker modal
  const [isDateRangePickerVisible, setIsDateRangePickerVisible] =
    useState(false);

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
            color={textOnSecondary}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{ flexDirection: "row", justifyContent: "center", gap: wp(10) }}
      >
        <CommonButton
          onPress={() => setIsDateRangePickerVisible(true)}
          title={
            startDate && endDate
              ? `${format(startDate, "MMM d, yyyy")} – ${format(endDate, "MMM d, yyyy")}`
              : startDate
                ? `${format(startDate, "MMM d, yyyy")} – Present`
                : "Select date range"
          }
          backgroundColor={secondary}
          titleColor={textOnSecondary}
          marginTop={hp(1)}
          iconLeft={{
            family: "AntDesign",
            name: "calendar",
            color: textOnSecondary,
            size: wp(5.5),
          }}
        />
      </View>

      <DateRangePickerModal
        visible={isDateRangePickerVisible}
        onClose={() => setIsDateRangePickerVisible(false)}
        onApply={(newStart, newEnd) => {
          if (newStart) {
            newStart.setHours(0, 0, 0, 0);
            setStartDate(newStart);
          } else setStartDate(null);
          if (newEnd) {
            newEnd.setHours(23, 59, 59, 999);
            setEndDate(newEnd);
          } else setEndDate(null);
          setIsDateRangePickerVisible(false);
        }}
        initialStartDate={startDate}
        initialEndDate={endDate}
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
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: hp(2),
          }}
        >
          <ActivityIndicator size="large" color={strongPrimary} />
        </View>
      ) : (
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
                { width: wp(20), color: strongPrimary, textAlign: "center" },
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
      )}
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
            color={strongPrimary}
            style={{ marginBottom: hp(0.8) }}
          />
          <Text
            style={{
              fontFamily: "Gantari-Bold",
              fontSize: wp(4.6),
              textAlign: "center",
              color: textOnPrimary,
            }}
          >
            Export to Excel
          </Text>
          <Text
            style={{
              fontFamily: "Gantari-Regular",
              fontSize: wp(3.6),
              color: textMuted,
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
            titleColor={textOnStrongPrimary}
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
            marginTop={0}
          />
        </View>
      </ModalTemplate>
    </View>
  );
};

export default StockReportListScreen;

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
