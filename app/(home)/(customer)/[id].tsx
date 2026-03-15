import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState, useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Input from "@/components/inputs/Input";
import { router, useLocalSearchParams } from "expo-router";
import { useCustomerContext } from "@/contexts/CustomerContext";
import { api } from "@/config/axios-api";
import { isAxiosError } from "axios";
import ModalTemplate from "@/components/modals/ModalTemplate";
import Toast from "react-native-toast-message";
import { Entypo } from "@expo/vector-icons";
import CommonButton from "@/components/buttons/CommonButton";
import FloatingButton from "@/components/buttons/FloatingButton";

const UpdateCustomerScreen = () => {
  const { primary, strongPrimary, textOnPrimary, textMuted, textOnStrongPrimary } =
    useTheme();
  const styles = useMemo(
    () => ({
      label: {
        fontSize: wp(4.5),
        fontFamily: "Gantari-Medium",
        marginBottom: hp(0.5),
        color: textOnPrimary,
      },
    }),
    [textOnPrimary]
  );
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
      const { customerName, customerInfo } = customerForm;
      const response = await api.put(`/customers/update/${id}`, {
        customerName,
        customerInfo,
      });
      Toast.show({ type: "success", text1: `${response?.data.message}` });
      router.back();
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({ type: "error", text1: `${error.response?.data.error}` });
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
      const response = await api.delete(`/customers/delete/${id}`);
      Toast.show({ type: "success", text1: `${response?.data.message}` });
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({ type: "error", text1: `${error.response?.data.error}` });
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
          placeholderTextColor={textMuted}
          multiline
          style={{ fontFamily: "Gantari-Regular", fontSize: wp(4.5), color: textOnPrimary }}
        />
      </TouchableOpacity>

      <CommonButton
        onPress={async () => {
          await updateCustomer();
        }}
        title="Update Customer"
        backgroundColor={strongPrimary}
        titleColor={textOnStrongPrimary}
        marginTop={hp(3)}
        loading={isUpdatingCustomer}
      />
      <CommonButton
        onPress={() => {
          router.back();
        }}
        title="Cancel"
        titleColor={textOnPrimary}
        backgroundColor={primary}
        marginTop={hp(3)}
      />

      <FloatingButton
        backgroundColor={strongPrimary}
        onPress={() => {
          setIsDeleteModalVisible(true);
        }}
        icon={{ color: textOnStrongPrimary, family: "Entypo", name: "trash", size: wp(7) }}
      />
      <ModalTemplate
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        height={hp(34)}
        width={wp(88)}
      >
        <View style={{ alignItems: "center", paddingHorizontal: wp(2) }}>
          <Entypo
            name="trash"
            size={wp(14)}
            color="#ef4444"
            style={{ marginBottom: hp(1) }}
          />
          <Text
            style={{
              fontFamily: "Gantari-Bold",
              fontSize: wp(5),
              color: textOnPrimary,
              textAlign: "center",
            }}
          >
            Delete {customer.customerName}?
          </Text>
          <Text
            style={{
              fontFamily: "Gantari-Regular",
              fontSize: wp(3.8),
              color: textMuted,
              textAlign: "center",
              marginTop: hp(1),
              lineHeight: hp(2.4),
            }}
          >
            This action cannot be undone. All records related to this customer
            will be permanently removed.
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: wp(3),
            marginTop: hp(3),
          }}
        >
          <CommonButton
            title="Cancel"
            onPress={() => setIsDeleteModalVisible(false)}
            backgroundColor="#F3F4F6"
            titleColor={textOnStrongPrimary}
            marginTop={0}
          />
          <CommonButton
            title="Delete"
            onPress={async () => await deleteCustomer()}
            backgroundColor="#ef4444"
            titleColor="#ffffff"
            marginTop={0}
          />
        </View>
      </ModalTemplate>
    </View>
  );
};

export default UpdateCustomerScreen;
