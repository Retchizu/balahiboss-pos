import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RecentStackParamList } from "../types/type";
import CustomerReportScreen from "../screens/sales-report-stack/CustomerReportScreen";
import RecentScreen from "../screens/mainDrawer/pos/RecentScreen";
import { EditCustomerReportTabScreen } from "./EditCustomerReportTab";

const RecentStack = createNativeStackNavigator<RecentStackParamList>();

export const RecentStackScreen = () => (
  <RecentStack.Navigator screenOptions={{ headerShown: false }}>
    <RecentStack.Screen name="RecentScreen" component={RecentScreen} />
    <RecentStack.Screen
      name="CustomerReportScreen"
      component={CustomerReportScreen}
    />
  </RecentStack.Navigator>
);
