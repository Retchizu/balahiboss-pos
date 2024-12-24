import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SalesReportStackParamList } from "../types/type";
import { EditCustomerReportTabScreen } from "./EditCustomerReportTab";
import SalesReportListScreen from "../screens/mainDrawer/sales-report-stack/SalesReportListScreen";
import CustomerReportScreen from "../screens/mainDrawer/sales-report-stack/CustomerReportScreen";
import { CurrentSalesReportProvider } from "../context/CurrentSalesReportContext";

const SalesReportStack =
  createNativeStackNavigator<SalesReportStackParamList>();

export const SalesReportStackScreen = () => (
  <CurrentSalesReportProvider>
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
  </CurrentSalesReportProvider>
);
