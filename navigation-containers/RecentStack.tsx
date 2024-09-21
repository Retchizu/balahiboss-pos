import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RecentStackParamList } from "../types/type";
import RecentScreen from "../screens/mainDrawer/pos/RecentScreen";
import CustomerReportScreen from "../screens/mainDrawer/sales-report-stack/CustomerReportScreen";

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
