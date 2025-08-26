import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import { primary, strongPrimary } from "@/theme/backgroundTheme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Input from "@/components/inputs/Input";
import CommonButton from "@/components/buttons/CommonButton";
import { router } from "expo-router";
import { isAxiosError } from "axios";
import { api } from "@/config/axios-api";
import Toast from "react-native-toast-message";

const AddCustomerScreen = () => {
  const [customerForm, setCustomerForm] = useState({
    customerName: "",
    customerInfo: "",
  });
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setCustomerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const customerInfoInputRef = useRef<TextInput | null>(null);

  // add customer
  const addCustomer = async () => {
    try {
      setIsAddingCustomer(true);
      const response = await api.post("/customer/add", customerForm);
      router.back();
      Toast.show({ type: "success", text1: `${response?.data.message}` });
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({ type: "error", text1: `${error.response?.data.error}` });
      }
      console.error("Add Customer failed:", error);
    } finally {
      setIsAddingCustomer(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(5),
      }}
    >
      <Text style={styles.label}>Customer Name</Text>
      <Input
        value={customerForm.customerName}
        onChangeText={(text) => handleInputChange("customerName", text)}
        placeholder="Enter customer name"
      />
      <Text style={[styles.label, { marginTop: hp(1) }]}>
        Customer Information
      </Text>
      <TouchableOpacity
        style={{
          borderColor: strongPrimary,
          borderWidth: wp(0.3),
          borderRadius: wp(2),
          padding: wp(1),
          height: hp(30),
        }}
        activeOpacity={1}
        onPress={() => customerInfoInputRef.current?.focus()}
      >
        <TextInput
          ref={customerInfoInputRef}
          value={customerForm.customerInfo}
          onChangeText={(text) => handleInputChange("customerInfo", text)}
          placeholder="Enter Customer Information"
          multiline
          style={{ fontFamily: "Gantari-Regular", fontSize: wp(4.5) }}
        />
      </TouchableOpacity>

      <CommonButton
        onPress={async () => {
          await addCustomer();
        }}
        title="Add Customer"
        titleColor={"white"}
        loading={isAddingCustomer}
        marginTop={hp(3)}
      />
      <CommonButton
        onPress={() => {
          router.back();
        }}
        title="Cancel"
        backgroundColor={primary}
        marginTop={hp(3)}
      />
    </View>
  );
};

export default AddCustomerScreen;

const styles = StyleSheet.create({
  label: {
    fontSize: wp(4.5),
    fontFamily: "Gantari-Medium",
    marginBottom: hp(0.5),
  },
});
