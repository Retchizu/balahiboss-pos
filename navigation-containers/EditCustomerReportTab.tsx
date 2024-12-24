import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { EditCustomerReportTabParamList } from "../types/type";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import EditCustomerReportScreen from "../screens/mainDrawer/sales-report-stack/edit-customer-report/EditCustomerReportScreen";
import ProductListEditCustomerReportScreen from "../screens/mainDrawer/sales-report-stack/edit-customer-report/ProductListEditCustomerReportScreen";
import PreviewEditCustomerReportScreen from "../screens/mainDrawer/sales-report-stack/edit-customer-report/PreviewEditCustomerReportScreen";

const EditCustomerReportTab =
  createBottomTabNavigator<EditCustomerReportTabParamList>();

export const EditCustomerReportTabScreen = () => {
  return (
    <EditCustomerReportTab.Navigator
      screenOptions={{
        headerTitle: "Edit Mode",
        headerTitleAlign: "center",
        headerTitleStyle: {
          color: "#634F40",
          fontFamily: "SoraExtraBold",
        },
        headerStyle: { height: hp(5), backgroundColor: "#F3F0E9" },
        tabBarStyle: {
          backgroundColor: "#F0D8B8",
        },
        tabBarLabelStyle: {
          fontFamily: "SoraSemiBold",
          fontSize: wp(3),
          color: "#634F40",
        },
        tabBarActiveBackgroundColor: "#E6B794",
        tabBarHideOnKeyboard: true,
      }}
    >
      <EditCustomerReportTab.Screen
        name="EditCustomerReportScreen"
        component={EditCustomerReportScreen}
        options={{
          tabBarIcon: () => <AntDesign name="form" size={24} color="#634F40" />,
          tabBarLabel: "Edit Invoice",
        }}
      />
      <EditCustomerReportTab.Screen
        name="ProductListEditCustomerReportScreen"
        component={ProductListEditCustomerReportScreen}
        options={{
          tabBarIcon: () => <Entypo name="box" size={24} color="#634F40" />,
          tabBarLabel: "Product List",
        }}
      />
      <EditCustomerReportTab.Screen
        name="PreviewEditCustomerReportScreen"
        component={PreviewEditCustomerReportScreen}
        options={{
          tabBarIcon: () => (
            <Entypo name="shopping-cart" size={24} color="#634F40" />
          ),
          tabBarLabel: "Cart",
        }}
      />
    </EditCustomerReportTab.Navigator>
  );
};
