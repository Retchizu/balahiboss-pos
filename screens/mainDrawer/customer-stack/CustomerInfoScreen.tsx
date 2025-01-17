import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { CustomerInfoScreenProp } from "../../../types/type";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Button } from "@rneui/base";
import Entypo from "@expo/vector-icons/Entypo";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { deleteCustomerData } from "../../../methods/data-methods/deleteCustomerData";
import { useCustomerContext } from "../../../context/CustomerContext";
import { useToastContext } from "../../../context/ToastContext";
import { useUserContext } from "../../../context/UserContext";
import { useCurrentCustomerContext } from "../../../context/CurrentCustomerContext";

const CustomerInfoScreen = ({ navigation }: CustomerInfoScreenProp) => {
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false);
  const { customers, setCustomerList } = useCustomerContext();
  const { showToast } = useToastContext();
  const { user } = useUserContext();
  const { currentCustomer } = useCurrentCustomerContext();
  return (
    <View
      style={[
        styles.container,
        { opacity: isConfirmationModalVisible ? 0.1 : 1 },
      ]}
    >
      <View style={styles.infoStyle}>
        <Text style={styles.labelStyle}>Customer Name: </Text>
        <Text style={styles.valueStyle}>{currentCustomer!.customerName}</Text>
      </View>
      <Text style={styles.labelStyle}>Customer Info </Text>
      <View style={styles.infoBox}>
        <Text style={styles.valueStyle}>{currentCustomer!.customerInfo}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          icon={<Entypo name="trash" size={24} color="#F3F0E9" />}
          buttonStyle={styles.buttonStyle}
          onPress={() => setIsConfirmationModalVisible(true)}
        />
        <Button
          icon={<Entypo name="edit" size={24} color="#F3F0E9" />}
          buttonStyle={styles.buttonStyle}
          onPress={() => navigation.navigate("EditCustomerScreen")}
        />
      </View>

      <ConfirmationModal
        isVisible={isConfirmationModalVisible}
        confirmationTitle={`Delete Customer "${currentCustomer!.customerName}"`}
        confirmationDescription="Are you sure you want to delete this customer?"
        cancelFn={() => setIsConfirmationModalVisible(false)}
        confirmFn={async () => {
          navigation.goBack();
          await deleteCustomerData(
            currentCustomer!.id,
            customers,
            setCustomerList,
            showToast,
            user
          );
          setIsConfirmationModalVisible(false);
        }}
        setIsVisible={setIsConfirmationModalVisible}
      />
    </View>
  );
};

export default CustomerInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(2),
    backgroundColor: "#F3F0E9",
  },
  infoStyle: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(4.5),
  },
  valueStyle: {
    fontFamily: "SoraRegular",
    fontSize: wp(4.5),
    maxWidth: wp(70),
  },
  infoBox: {
    borderWidth: wp(0.5),
    borderRadius: wp(1.5),
    padding: wp(2),
    borderColor: "#634F40",
    height: hp(50),
  },
  buttonStyle: {
    backgroundColor: "#E6B794",
    borderRadius: wp(1.5),
    marginHorizontal: wp(2),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginVertical: hp(2),
  },
});
