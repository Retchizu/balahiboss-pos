import { View } from "react-native";
import { useState } from "react";
import CustomerForm from "../../../components/CustomerForm";
import { updateCustomerData } from "../../../methods/data-methods/updateCustomerData";
import { useCustomerContext } from "../../../context/CustomerContext";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useToastContext } from "../../../context/ToastContext";
import Toast from "react-native-toast-message";
import { useUserContext } from "../../../context/UserContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useCurrentCustomerContext } from "../../../context/CurrentCustomerContext";

const EditCustomerScreen = () => {
  const { currentCustomer, updateCurrentCustomer } =
    useCurrentCustomerContext();
  const [customer, setCustomer] = useState({
    customerName: currentCustomer!.customerName,
    customerInfo: currentCustomer!.customerInfo,
  });

  const { updateCustomer } = useCustomerContext();
  const { showToast } = useToastContext();
  const { user } = useUserContext();
  const [loading, setLoading] = useState(false);

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
            submit={async () => {
              setLoading(true);
              await updateCustomerData(
                currentCustomer!.id,
                customer,
                updateCurrentCustomer,
                updateCustomer,
                showToast,
                user
              );
              setLoading(false);
            }}
            loading={loading}
          />
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
};

export default EditCustomerScreen;
