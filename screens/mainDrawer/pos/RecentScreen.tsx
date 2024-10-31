import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSalesReportContext } from "../../../context/SalesReportContext";
import { readableTime } from "../../../methods/time-methods/readableTime";
import { getSalesReportData } from "../../../methods/data-methods/getSalesReportData";
import { RecentScreenProp } from "../../../types/type";
import { useToastContext } from "../../../context/ToastContext";
import Toast from "react-native-toast-message";
import { useUserContext } from "../../../context/UserContext";
import { useRecentSalesReportManager } from "../../../hooks/useRecentSalesReportManager";
import { useProductContext } from "../../../context/ProductContext";

const RecentScreen = ({ navigation }: RecentScreenProp) => {
  const { salesReports, setSalesReportList } = useSalesReportContext();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToastContext();
  const { user } = useUserContext();
  const { products } = useProductContext();
  let startDate = new Date();
  let endDate = new Date();

  useEffect(() => {
    getSalesReportData(
      startDate,
      endDate,
      setSalesReportList,
      setIsLoading,
      showToast,
      user
    );
  }, [products]);

  const sortedData = useRecentSalesReportManager(
    startDate,
    endDate,
    salesReports
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Today's recent input</Text>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator color={"#634F40"} size={wp(10)} />
        </View>
      ) : sortedData.length ? (
        <FlatList
          data={sortedData}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.customerInfoContainer}
              activeOpacity={0.5}
              onPress={() =>
                navigation.navigate("CustomerReportScreen", {
                  id: item.id,
                  cashPayment: item.invoiceForm.cashPayment,
                  onlinePayment: item.invoiceForm.onlinePayment,
                  customer: item.invoiceForm.customer,
                  date: item.invoiceForm.date
                    ? item.invoiceForm.date.toISOString()
                    : null,
                  deliveryFee: item.invoiceForm.deliveryFee,
                  discount: item.invoiceForm.discount,
                  freebies: item.invoiceForm.freebies,
                  selectedProducts: item.selectedProduct,
                  fromSales: false,
                })
              }
            >
              <Text style={styles.customerName}>
                {item.invoiceForm.customer?.customerName}
              </Text>
              <Text style={styles.timeStyle}>
                {readableTime(item.invoiceForm.date!)}
              </Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.messageContainer}>
          <Text style={styles.messageStyle}>
            No invoices have been created today.
          </Text>
        </View>
      )}
      <Toast position="bottom" autoHide visibilityTime={2000} />
    </View>
  );
};

export default RecentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0E9",
    paddingHorizontal: wp(5),
    paddingBottom: hp(1),
  },
  headerTitle: {
    fontFamily: "SoraBold",
    fontSize: wp(5),
    textAlign: "center",
    color: "#634F40",
    marginBottom: hp(2),
    borderBottomColor: "#634F40",
    borderBottomWidth: wp(0.2),
    padding: hp(1),
  },
  customerInfoContainer: {
    borderWidth: wp(0.3),
    borderColor: "#634F40",
    padding: wp(2),
    marginVertical: hp(0.5),
    borderRadius: wp(1.5),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerName: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(4),
  },
  timeStyle: {
    fontFamily: "SoraMedium",
    fontSize: wp(3.5),
  },
  messageStyle: {
    fontSize: wp(4.5),
    fontFamily: "SoraBold",
    textAlign: "center",
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
