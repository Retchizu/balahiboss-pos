import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Button, Input } from "@rneui/base";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Customer, CustomerRootStackParamList } from "../type";
import { auth, db } from "../firebaseconfig";
import Toast from "react-native-simple-toast";
import { useCustomerContext } from "../context/customerContext";

type Props = NativeStackScreenProps<
  CustomerRootStackParamList,
  "AddCustomerScreen"
>;

const AddCustomerScreen = ({ navigation }: Props) => {
  const { addCustomer } = useCustomerContext();
  const [customerName, setCustomerName] = useState("");
  const [customerInfo, setCustomerInfo] = useState("");

  //add Customer in db
  const addData = async () => {
    try {
      if (customerName) {
        const user = auth.currentUser;
        if (user) {
          const docRef = await db
            .collection("users")
            .doc(user.uid)
            .collection("customers")
            .add({
              customerName,
              customerInfo,
            });

          const newCustomer: Customer = {
            id: docRef.id,
            customerName,
            customerInfo,
          };

          addCustomer(newCustomer);
        } else {
          Toast.show("Customer name should not be empty", Toast.SHORT);
        }
        Toast.show("Added successfully", Toast.SHORT);
        navigation.pop();
      }
    } catch (error) {
      console.log("Error adding data: ", error as Error);
    }
  };
  return (
    <SafeAreaView style={{ backgroundColor: "#f7f7f7" }}>
      <View>
        <Text style={styles.textStyle}>Add a Customer</Text>
        <Text style={styles.labelStyle}>Customer name:</Text>
        <Input
          placeholder="Customer name"
          style={styles.inputContainerStyle}
          inputContainerStyle={{ borderColor: "white" }}
          value={customerName}
          onChangeText={(text) => {
            setCustomerName(text);
          }}
        />
        <Text style={styles.labelStyle}>Customer Info:</Text>
        <Input
          placeholder="Customer Info"
          style={styles.inputContainerStyle}
          inputContainerStyle={{ borderColor: "white" }}
          value={customerInfo}
          onChangeText={(text) => setCustomerInfo(text)}
          multiline
        />

        <Button
          title={"Confirm"}
          buttonStyle={{ backgroundColor: "pink" }}
          containerStyle={{
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

export default AddCustomerScreen;

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
