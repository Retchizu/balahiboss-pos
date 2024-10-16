import { View } from "react-native";
import React, { useState } from "react";
import CustomerForm from "../../../components/CustomerForm";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { addCustomerData } from "../../../methods/data-methods/addCustomerData";
import { useCustomerContext } from "../../../context/CustomerContext";
import { handleInputChange } from "../../../methods/handleInputChange";
import { AddCustomerScreenProp } from "../../../types/type";
import { CommonActions } from "@react-navigation/native";
import { useToastContext } from "../../../context/ToastContext";
import Toast from "react-native-toast-message";
import { useUserContext } from "../../../context/UserContext";

const AddCustomerScreen = ({ navigation, route }: AddCustomerScreenProp) => {
  const params = route.params;
  const [customer, setCustomer] = useState({
    customerName: "",
    customerInfo: "",
  });
  const { addCustomer } = useCustomerContext();
  const { showToast } = useToastContext();
  const { user } = useUserContext();
  const handleCustomerAddSubmit = async () => {
    const customerData = await addCustomerData(
      customer,
      addCustomer,
      showToast,
      user
    );
    handleInputChange("customerName", "", setCustomer);
    handleInputChange("customerInfo", "", setCustomer);
    if (params) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "InvoiceScreen", params: customerData }],
        })
      );
    }
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
        setCustomer={setCustomer}
        buttonLabel="Add Customer"
        formTitle="Add a customer"
        submit={handleCustomerAddSubmit}
      />
      <Toast position="bottom" autoHide visibilityTime={2000} />
    </View>
  );
};

export default AddCustomerScreen;
