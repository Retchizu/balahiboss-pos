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
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Input from "@/components/inputs/Input";
import { router, useLocalSearchParams } from "expo-router";
import { useCustomerContext } from "@/contexts/CustomerContext";
import CommonButton from "@/components/buttons/CommonButton";
import FloatingButton from "@/components/buttons/FloatingButton";
import { api } from "@/config/axios-api";
import { isAxiosError } from "axios";
import ModalTemplate from "@/components/modals/ModalTemplate";

const UpdateCustomerScreen = () => {
  // customer params
  const { id }: { id: string } = useLocalSearchParams();
  const { customers } = useCustomerContext();
  const customer = customers[id];

  // customer form state
  const [customerForm, setCustomerForm] = useState({
    customerName: customer.customerName,
    customerInfo: customer.customerInfo,
  });

  const handleInputChange = (field: string, value: string) => {
    setCustomerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const customerInfoInputRef = useRef<TextInput | null>(null);

  // update customer
  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);
  const updateCustomer = async () => {
    try {
      setIsUpdatingCustomer(true);
      const {customerName, customerInfo} = customerForm;
      const response = await api.put(`/customer/update/${id}`, {
        customerName,
        customerInfo
      })
      console.log(response.data.message)
      router.back();
    } catch (error) {
      if (isAxiosError(error)) {
        console.error("Update Customer Failed: ", error.response?.data.message);
      }
      console.error("Update Customer Failed: ", error);
    } finally {
      setIsUpdatingCustomer(false);
    }
  };

  // delete customer
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const deleteCustomer = async () => {
    try {
      setIsDeleteModalVisible(false);
      router.back();
      const response = await api.delete(`/customer/delete/${id}`);
      console.log(response.data);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error("Delete Customer Failed: ", error.response?.data.message);
      }
      console.error("Delete Customer Failed: ", error);
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
        onPress={async () => {await updateCustomer()}}
        title="Update Customer"
        titleColor={"white"}
        marginTop={hp(3)}
        loading={isUpdatingCustomer}
      />
      <CommonButton
        onPress={() => {
          router.back();
        }}
        title="Cancel"
        backgroundColor={primary}
        marginTop={hp(3)}
      />

      <FloatingButton
        backgroundColor={strongPrimary}
        onPress={() => {
          setIsDeleteModalVisible(true);
        }}
        icon={{ color: "white", family: "Entypo", name: "trash", size: wp(7) }}
      />
      <ModalTemplate
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        height={hp(20)}
        width={wp(90)}
      >
        <Text style={{ fontFamily: "Gantari-Bold", fontSize: wp(5) }}>
          Are you sure you want to delete {customer.customerName}?
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            flex: 1,
            gap: wp(10),
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsDeleteModalVisible(false)}
          >
            <Text
              style={{
                fontFamily: "Gantari-SemiBold",
                fontSize: wp(6),
                padding: wp(2),
              }}
            >
              No
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => await deleteCustomer()}
          >
            <Text
              style={{
                color: "#ff6347",
                fontFamily: "Gantari-SemiBold",
                fontSize: wp(6),
                padding: wp(2),
              }}
            >
              Yes
            </Text>
          </TouchableOpacity>
        </View>
      </ModalTemplate>
    </View>
  );
};

export default UpdateCustomerScreen;

const styles = StyleSheet.create({
  label: {
    fontSize: wp(4.5),
    fontFamily: "Gantari-Medium",
    marginBottom: hp(0.5),
  },
});
