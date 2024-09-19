import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { InvoiceStackParamList } from "../types/type";
import InvoiceScreen from "../screens/mainDrawer/pos/InvoiceScreen";
import AddCustomerScreen from "../screens/mainDrawer/customer-stack/AddCustomerScreen";

const InvoiceStack = createNativeStackNavigator<InvoiceStackParamList>();

export const InvoiceStackScreen = () => (
  <InvoiceStack.Navigator screenOptions={{ headerShown: false }}>
    <InvoiceStack.Screen name="InvoiceScreen" component={InvoiceScreen} />
    <InvoiceStack.Screen
      name="AddCustomerScreen"
      component={AddCustomerScreen}
    />
  </InvoiceStack.Navigator>
);
