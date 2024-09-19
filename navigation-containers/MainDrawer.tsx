import { createDrawerNavigator } from "@react-navigation/drawer";
import { DrawerParamList } from "../types/type";
import { POSScreen } from "./POSTab";
import { ProductProvider } from "../context/ProductContext";
import { SelectedProductProvider } from "../context/SelectedProductContext";
import { CustomerProvider } from "../context/CustomerContext";
import { CustomerStackScreen } from "./CustomerStack";
import { ProductStackScreen } from "./ProductStack";
import { SalesReportProvider } from "../context/SalesReportContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { SalesReportStackScreen } from "./SalesReportStack";
import Entypo from "@expo/vector-icons/Entypo";
import CustomDrawerComponent from "../components/CustomDrawerComponent";

const MainDrawer = createDrawerNavigator<DrawerParamList>();

export const MainDrawerScreen = () => (
  <ProductProvider>
    <SelectedProductProvider>
      <CustomerProvider>
        <SalesReportProvider>
          <MainDrawer.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: "#F0D8B8",
              },
              headerTitleAlign: "center",
              headerTitleStyle: {
                color: "#634F40",
                fontFamily: "SoraBold",
              },
              headerTintColor: "#634F40",
              drawerLabelStyle: {
                fontFamily: "SoraSemiBold",
                fontSize: wp(5),
                color: "#634F40",
              },
              drawerActiveBackgroundColor: "#E6B794",
            }}
            drawerContent={(props) => <CustomDrawerComponent {...props} />}
          >
            <MainDrawer.Screen
              name="POSScreen"
              component={POSScreen}
              options={{
                headerTitle: "POS",
                title: "POS",
                drawerIcon: () => (
                  <Entypo name="dial-pad" size={24} color="#634F40" />
                ),
              }}
            />
            <MainDrawer.Screen
              name="ProductStackScreen"
              component={ProductStackScreen}
              options={{
                headerTitle: "Products",
                title: "Products",
                drawerIcon: () => (
                  <Entypo name="box" size={24} color="#634F40" />
                ),
              }}
            />
            <MainDrawer.Screen
              name="CustomerStackScreen"
              component={CustomerStackScreen}
              options={{
                headerTitle: "Customers",
                title: "Customers",
                drawerIcon: () => (
                  <Entypo name="users" size={24} color="#634F40" />
                ),
              }}
            />
            <MainDrawer.Screen
              name="SalesReportStackScreen"
              component={SalesReportStackScreen}
              options={{
                headerTitle: "Sales Reports",
                title: "Sales Report",
                drawerIcon: () => (
                  <Entypo name="bar-graph" size={24} color="#634F40" />
                ),
              }}
            />
          </MainDrawer.Navigator>
        </SalesReportProvider>
      </CustomerProvider>
    </SelectedProductProvider>
  </ProductProvider>
);
