import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  EditCustomerReportTabScreenProp,
  SalesReportStackParamList,
} from "../types/type";
import CustomerReportScreen from "../screens/sales-report-stack/CustomerReportScreen";
import SalesReportListScreen from "../screens/sales-report-stack/SalesReportListScreen";
import { EditCustomerReportTabScreen } from "./EditCustomerReportTab";

const SalesReportStack =
  createNativeStackNavigator<SalesReportStackParamList>();

export const SalesReportStackScreen = () => (
  <SalesReportStack.Navigator screenOptions={{ headerShown: false }}>
    <SalesReportStack.Screen
      name="SalesReportScreen"
      component={SalesReportListScreen}
    />
    <SalesReportStack.Screen
      name="CustomerReportScreen"
      component={CustomerReportScreen}
    />
    <SalesReportStack.Screen
      name="EditCustomerReportTabScreen"
      component={EditCustomerReportTabScreen}
    />
  </SalesReportStack.Navigator>
);
