import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { ExpenseRootStackParamList } from "../type";
import { auth, db } from "../firebaseconfig";
import { SafeAreaView } from "react-native-safe-area-context";
import Dialog from "react-native-dialog";
import Toast from "react-native-simple-toast";
import { Feather } from "@expo/vector-icons";
import { useExpenseReportContext } from "../context/expenseReportContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type ViewExpenseSummaryScreenProp = {
  route: RouteProp<ExpenseRootStackParamList, "ViewExpenseSummaryScreen">;
};
const ViewExpenseSummaryScreen = ({ route }: ViewExpenseSummaryScreenProp) => {
  const item = route.params;
  const itemDate =
    typeof item.expenseDate === "string"
      ? new Date(item.expenseDate)
      : item.expenseDate;
  const userName = auth.currentUser?.displayName;
  const [isVisible, setIsVisible] = useState(false);
  const { expenseList, setExpense } = useExpenseReportContext();
  const navigation = useNavigation();

  const deleteData = async (reportId: String) => {
    try {
      const user = auth.currentUser;
      await db
        .collection("users")
        .doc(user?.uid)
        .collection("expense")
        .doc(reportId.toString())
        .delete();

      const updatedData = expenseList.filter(
        (element) => element.id !== reportId
      );
      setExpense(updatedData);
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
          {`${userName}'s Expense Report`}
        </Text>
        <Text style={styles.labelStyle}>
          Expense title: {item.expenseTitle}
        </Text>

        <Text style={styles.labelStyle}>
          Expense Description: {item.expenseDescription}
        </Text>
        <Text style={styles.labelStyle}>
          Expense Date: {formatDateString(itemDate)}
        </Text>
        <Text style={styles.labelStyle}>
          Expense cost: ₱{item.expenseCost.toString()}
        </Text>
      </View>
      <View
        style={{
          position: "absolute",
          right: wp("5%"),
          bottom: hp("3%"),
        }}
      >
        <TouchableOpacity
          style={{ backgroundColor: "#af71bd", padding: 5, borderRadius: 20 }}
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

export default ViewExpenseSummaryScreen;

const styles = StyleSheet.create({
  labelStyle: {
    fontSize: 18,
    marginVertical: 5,
  },
});
