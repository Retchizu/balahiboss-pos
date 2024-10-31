import { StyleSheet, View } from "react-native";
import { useState } from "react";
import CustomerForm from "../../../components/CustomerForm";
import { EditCustomerScreenProp } from "../../../types/type";
import { updateCustomerData } from "../../../methods/data-methods/updateCustomerData";
import { useCustomerContext } from "../../../context/CustomerContext";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useToastContext } from "../../../context/ToastContext";
import Toast from "react-native-toast-message";
import { useUserContext } from "../../../context/UserContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const EditCustomerScreen = ({ route, navigation }: EditCustomerScreenProp) => {
  const customerId = route.params.id;
  const [customer, setCustomer] = useState({
    customerName: route.params.customerName,
    customerInfo: route.params.customerInfo,
  });

  const { updateCustomer } = useCustomerContext();
  const { showToast } = useToastContext();
  const { user } = useUserContext();

  const handleCustomerUpdateSubmit = () => {
    updateCustomerData(customerId, customer, updateCustomer, showToast, user);

    navigation.pop();
    navigation.replace("CustomerInfoScreen", {
      id: customerId,
      customerName: customer.customerName,
      customerInfo: customer.customerInfo,
    });
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
      <View>
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <CustomerForm
            customer={customer}
            buttonLabel="Update Customer"
            formTitle="Update a customer"
            setCustomer={setCustomer}
            submit={() => handleCustomerUpdateSubmit()}
          />
          <Toast position="bottom" autoHide visibilityTime={2000} />
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
};

export default EditCustomerScreen;

const styles = StyleSheet.create({});
