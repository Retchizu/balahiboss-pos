import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import CustomerForm from "../../../components/CustomerForm";
import { Customer, EditCustomerScreenProp } from "../../../types/type";
import { updateCustomerData } from "../../../methods/data-methods/updateCustomerData";
import { useCustomerContext } from "../../../context/CustomerContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const EditCustomerScreen = ({ route, navigation }: EditCustomerScreenProp) => {
  const customerId = route.params.id;
  const [customer, setCustomer] = useState({
    customerName: route.params.customerName,
    customerInfo: route.params.customerInfo,
  });
  const { updateCustomer } = useCustomerContext();

  const handleCustomerUpdateSubmit = () => {
    updateCustomerData(customerId, customer, updateCustomer);
    navigation.goBack();
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: wp(5),
        backgroundColor: "#F3F0E9",
      }}
    >
      <CustomerForm
        customer={customer}
        buttonLabel="Update Customer"
        formTitle="Update a customer"
        setCustomer={setCustomer}
        submit={handleCustomerUpdateSubmit}
      />
    </View>
  );
};

export default EditCustomerScreen;

const styles = StyleSheet.create({});
