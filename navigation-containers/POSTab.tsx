import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { POSTabParamList } from "../types/type";
import ProductScreen from "../screens/mainDrawer/pos/ProductScreen";
import PreviewScreen from "../screens/mainDrawer/pos/PreviewScreen";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { InvoiceStackScreen } from "./InvoiceStack";
import { RecentStackScreen } from "./RecentStack";

const POSTab = createBottomTabNavigator<POSTabParamList>();

export const POSScreen = () => (
  <POSTab.Navigator
    screenOptions={{
      headerShown: false,
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
    <POSTab.Screen
      name="ProductScreen"
      component={ProductScreen}
      options={{
        tabBarIcon: () => <Entypo name="box" size={24} color="#634F40" />,
        tabBarLabel: "Products",
      }}
    />
    <POSTab.Screen
      name="PreviewScreen"
      component={PreviewScreen}
      options={{
        tabBarIcon: () => (
          <Entypo name="shopping-cart" size={24} color="#634F40" />
        ),
        tabBarLabel: "Cart",
      }}
    />
    <POSTab.Screen
      name="InvoiceStackScreen"
      component={InvoiceStackScreen}
      options={{
        tabBarIcon: () => (
          <FontAwesome5 name="file-invoice" size={24} color="#634F40" />
        ),
        tabBarLabel: "Invoice",
      }}
    />
    <POSTab.Screen
      name="RecentStackScreen"
      component={RecentStackScreen}
      options={{
        tabBarIcon: () => <Entypo name="archive" size={24} color="#634F40" />,
        tabBarLabel: "Recent",
      }}
    />
  </POSTab.Navigator>
);
