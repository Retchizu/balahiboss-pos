import { Platform, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input } from "@rneui/base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ExpenseReport, ExpenseRootStackParamList } from "../type";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { auth, db } from "../firebaseconfig";
import Toast from "react-native-simple-toast";
import { useExpenseReportContext } from "../context/expenseReportContext";

type Props = NativeStackScreenProps<
  ExpenseRootStackParamList,
  "AddExpenseScreen"
>;

const AddExpenseScreen = ({ navigation }: Props) => {
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseCost, setExpenseCost] = useState("");
  const [expenseDate, setExpenseDate] = useState<Date>(new Date());
  const [show, setShow] = useState(false);
  const { addExpense } = useExpenseReportContext();

  const addData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = await db
          .collection("users")
          .doc(user.uid)
          .collection("expense")
          .add({
            expenseTitle,
            expenseDescription,
            expenseDate,
            expenseCost: !expenseCost ? 0 : parseFloat(expenseCost),
          });
        const newExpense: ExpenseReport = {
          id: docRef.id,
          expenseTitle,
          expenseDescription,
          expenseDate,
          expenseCost: parseFloat(expenseCost),
        };
        addExpense(newExpense);
      }
      Toast.show("Added Successfully", Toast.SHORT);
    } catch (error) {
      Toast.show((error as Error).message, Toast.SHORT);
    } finally {
      navigation.goBack();
    }
  };
  const formatDateString = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const showDatepicker = () => {
    setShow(!show);
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      const currentDate = selectedDate;
      setExpenseDate(currentDate);
      if (Platform.OS === "android") {
        showDatepicker();
        setExpenseDate(currentDate);
      }
    } else {
      showDatepicker();
    }
  };

  const confirmIosDate = () => {
    setExpenseDate(expenseDate);
    showDatepicker();
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
      <View>
        <Text style={styles.textStyle}>Add expense</Text>
        <Text style={styles.labelStyle}>Expense Title:</Text>
        <Input
          placeholder="Expense title"
          style={styles.inputContainerStyle}
          inputContainerStyle={{ borderColor: "white" }}
          value={expenseTitle}
          onChangeText={(text) => {
            setExpenseTitle(text);
          }}
        />
        <Text style={styles.labelStyle}>Expense Description:</Text>
        <Input
          placeholder="Expense description"
          style={styles.inputContainerStyle}
          inputContainerStyle={{ borderColor: "white" }}
          value={expenseDescription}
          onChangeText={(text) => setExpenseDescription(text)}
          multiline
        />
        <Text style={styles.labelStyle}>Expense Cost:</Text>
        <Input
          placeholder="Expense Cost"
          style={styles.inputContainerStyle}
          inputContainerStyle={{ borderColor: "white" }}
          keyboardType="number-pad"
          value={expenseCost}
          onChangeText={(text) => setExpenseCost(text)}
        />
        <View style={{ flexDirection: "row" }}>
          <Text style={{ fontSize: 20, marginLeft: 10, alignSelf: "center" }}>
            Date of expense:{" "}
          </Text>
          <Button
            title={`${formatDateString(expenseDate)}`}
            onPress={() => setShow(true)}
            containerStyle={{
              borderRadius: 10,
              marginHorizontal: 10,
              flex: 1,
            }}
            titleStyle={{ fontSize: 14 }}
            buttonStyle={{ backgroundColor: "pink" }}
          />

          {show && (
            <DateTimePicker
              mode="date"
              display="calendar"
              value={expenseDate}
              onChange={onChange}
              minimumDate={new Date(2016, 0, 1)}
            />
          )}
          {show && Platform.OS === "ios" && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <Button
                title={"Cancel"}
                containerStyle={{
                  borderRadius: 10,
                  flex: 1,
                  marginHorizontal: 20,
                }}
                buttonStyle={{ backgroundColor: "pink" }}
                onPress={showDatepicker}
              />
              <Button
                title={"Confirm"}
                containerStyle={{
                  borderRadius: 10,
                  flex: 1,
                  marginHorizontal: 20,
                }}
                buttonStyle={{ backgroundColor: "pink" }}
                onPress={confirmIosDate}
              />
            </View>
          )}
        </View>
        <Button
          title={"Confirm"}
          buttonStyle={{ backgroundColor: "pink" }}
          containerStyle={{
            marginTop: 10,
            marginHorizontal: 10,
            borderRadius: 10,
          }}
          onPress={addData}
        />
        <Button
          title={"Cancel"}
          buttonStyle={{ backgroundColor: "pink" }}
          containerStyle={{
            marginTop: 20,
            marginHorizontal: 10,
            borderRadius: 10,
          }}
          onPress={navigation.goBack}
        />
      </View>
    </SafeAreaView>
  );
};

export default AddExpenseScreen;

const styles = StyleSheet.create({
  textStyle: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "500",
    marginTop: 20,
    color: "pink",
  },

  inputContainerStyle: {
    borderWidth: 5,
    borderColor: "pink",
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 20,
  },
  labelStyle: {
    marginTop: 20,
    paddingHorizontal: 20,
    fontSize: 20,
  },
});
