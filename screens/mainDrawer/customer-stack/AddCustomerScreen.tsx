import { View } from "react-native";
import { useState } from "react";
import CustomerForm from "../../../components/CustomerForm";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { addCustomerData } from "../../../methods/data-methods/addCustomerData";
import { useCustomerContext } from "../../../context/CustomerContext";
import { handleInputChange } from "../../../methods/handleInputChange";
import { AddCustomerScreenProp } from "../../../types/type";
import { CommonActions } from "@react-navigation/native";
import { useToastContext } from "../../../context/ToastContext";
import { useUserContext } from "../../../context/UserContext";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const AddCustomerScreen = ({ navigation, route }: AddCustomerScreenProp) => {
  const params = route.params;
  const [customer, setCustomer] = useState({
    customerName: "",
    customerInfo: "",
  });
  const { addCustomer } = useCustomerContext();
  const { showToast } = useToastContext();
  const { user } = useUserContext();
  const [loading, setLoading] = useState(false);

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
      <KeyboardAvoidingView behavior="position">
        <CustomerForm
          customer={customer}
          setCustomer={setCustomer}
          buttonLabel="Add Customer"
          formTitle="Add a customer"
          submit={async () => {
            setLoading(true);
            await handleCustomerAddSubmit();
            setLoading(false);
          }}
          loading={loading}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddCustomerScreen;
