import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CustomerStackParamList } from "../types/type";
import AddCustomerScreen from "../screens/mainDrawer/customer-stack/AddCustomerScreen";
import CustomerListScreen from "../screens/mainDrawer/customer-stack/CustomerListScreen";
import CustomerInfoScreen from "../screens/mainDrawer/customer-stack/CustomerInfoScreen";
import EditCustomerScreen from "../screens/mainDrawer/customer-stack/EditCustomerScreen";

const CustomerStack = createNativeStackNavigator<CustomerStackParamList>();

export const CustomerStackScreen = () => (
  <CustomerStack.Navigator
    initialRouteName="CustomerListScreen"
    screenOptions={{ headerShown: false }}
  >
    <CustomerStack.Screen
      name="CustomerListScreen"
      component={CustomerListScreen}
    />
    <CustomerStack.Screen
      name="AddCustomerScreen"
      component={AddCustomerScreen}
    />

    <CustomerStack.Screen
      name="CustomerInfoScreen"
      component={CustomerInfoScreen}
    />
    <CustomerStack.Screen
      name="EditCustomerScreen"
      component={EditCustomerScreen}
    />
  </CustomerStack.Navigator>
);
