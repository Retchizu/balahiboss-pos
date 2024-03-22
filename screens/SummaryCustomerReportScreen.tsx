import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { ReportRootStackParamList } from "../type";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { auth, db } from "../firebaseconfig";
import Dialog from "react-native-dialog";
import { useSalesReportContext } from "../context/salesReportContext";
import Toast from "react-native-simple-toast";
import { useProductContext } from "../context/productContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type SummaryCustomerReportSreenProp = {
  route: RouteProp<ReportRootStackParamList, "SummaryCustomerReportScreen">;
};
const SummaryCustomerReportScreen = ({
  route,
}: SummaryCustomerReportSreenProp) => {
  const item = route.params;
  const itemDate =
    typeof item.date === "string" ? new Date(item.date) : item.date;
  const userName = auth.currentUser?.displayName;
  const [isVisible, setIsVisible] = useState(false);
  const { salesReports, setSalesReportList } = useSalesReportContext();
  const { products, updateProduct } = useProductContext();
  const navigation = useNavigation();

  const deleteData = async (reportId: String) => {
    try {
      const user = auth.currentUser;
      await db
        .collection("users")
        .doc(user?.uid)
        .collection("sales")
        .doc(reportId.toString())
        .delete();

      const updatedData = salesReports.filter(
        (element) => element.id !== reportId
      );
      setSalesReportList(updatedData);
      item.productList.forEach((item) => {
        const productItem = products.find(
          (product) => product.id == item.product.id
        );
        const updatedTotalStockSold =
          productItem?.totalStockSold! - (item.quantity as number);
        const updatedStock = productItem?.stock! + (item.quantity as number);
        updateProduct(item.product.id, {
          totalStockSold: updatedTotalStockSold,
          stock: updatedStock,
        });
        db.collection("users")
          .doc(user?.uid)
          .collection("products")
          .doc(item.product.id.toString())
          .update({
            totalStockSold: updatedTotalStockSold,
            stock: updatedStock,
          });
      });
      Toast.show("report deleted successfully", Toast.SHORT);
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting report:", error);
      Toast.show("Error deleting report", Toast.SHORT);
    }
  };

  const formatDateString = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const computeProfit = () => {
    let total = 0;
    item.productList.forEach(
      (product) =>
        (total +=
          (product.product.sellPrice - product.product.stockPrice) *
          (product.quantity as number))
    );
    return (
      total -
      (item.otherExpense as number) -
      ((item.catTreatDiscount as number) +
        (item.dogTreatDiscount as number) +
        (item.gateDiscount as number))
    );
  };
  const totalAmount = () => {
    let total = 0;
    item.productList.forEach(
      (items) => (total += items.product.sellPrice * (items.quantity as number))
    );
    total = total - (item.otherExpense as number);
    return total;
  };
  const computeChange = () => {
    return (item.customerPayment as number) - totalAmount();
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f7f7f7", position: "relative" }}
    >
      <View style={{ marginHorizontal: 10 }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          {`${
            userName?.charAt(userName.length - 1).toLocaleLowerCase() === "s"
              ? `${userName}'`
              : `${userName}'s`
          } Customer Report`}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Customer name: {item.customer?.customerName}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Date bought: {formatDateString(itemDate)}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Total Amount: ₱{totalAmount().toFixed(2)}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Customer payment: ₱{item.customerPayment.toFixed(2)}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Given Discount: ₱{item.otherExpense.toFixed(2)}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Given Dog Treat Discount: ₱{item.dogTreatDiscount.toFixed(2)}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Given Cat Treat Discount: ₱{item.catTreatDiscount.toFixed(2)}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Given Gate Discount: ₱{item.gateDiscount.toFixed(2)}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Customer change w/discount: ₱{computeChange().toFixed(2)}
        </Text>

        <Text style={{ fontSize: 18 }}>
          Total Profit: ₱{computeProfit().toFixed(2)}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
          Products Bought:
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", flex: 2 }}>
            Product name
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "bold", flex: 1 }}>
            Price
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "bold", flex: 1 }}>
            Quantity
          </Text>
        </View>
        <FlatList
          data={item.productList}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                borderBottomWidth: 2,
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 16, flex: 2 }}>
                {item.product.productName}
              </Text>
              <Text style={{ fontSize: 16, flex: 1, color: "blue" }}>
                ₱{item.product.sellPrice.toFixed(2)}
              </Text>
              <Text style={{ fontSize: 16, flex: 1 }}>
                {item.quantity.toString()}
              </Text>
            </View>
          )}
        />
      </View>
      <View style={{ position: "absolute", right: wp("5%"), bottom: hp("4%") }}>
        <TouchableOpacity
          style={{ backgroundColor: "pink", padding: 6, borderRadius: 22 }}
          onPress={() => setIsVisible(true)}
        >
          <Feather name="trash-2" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <Dialog.Container visible={isVisible}>
        <Dialog.Title>Delete Report</Dialog.Title>
        <Dialog.Description>
          This will affect the reports, are you sure you want to delete?
        </Dialog.Description>
        <Dialog.Button label={"Cancel"} onPress={() => setIsVisible(false)} />
        <Dialog.Button label={"Confirm"} onPress={() => deleteData(item.id)} />
      </Dialog.Container>
    </SafeAreaView>
  );
};

export default SummaryCustomerReportScreen;

const styles = StyleSheet.create({});
