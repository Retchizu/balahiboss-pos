import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LogInScreen from "./screens/LogInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import {
  CustomerRootStackParamList,
  ExpenseRootStackParamList,
  PosRootStackParamList,
  ProductRootStackParamList,
  ReportRootStackParamList,
  RootStackParamList,
  RootTabParamList,
} from "./type";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import PosScreen from "./screens/PosScreen";
import ProductScreen from "./screens/ProductScreen";
import CustomerScreen from "./screens/CustomerScreen";
import ReportScreen from "./screens/ReportScreen";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { Fontisto } from "@expo/vector-icons";
import AddProductScreen from "./screens/AddProductScreen";
import SettingScreen from "./screens/SettingScreen";
import { FontAwesome } from "@expo/vector-icons";
import { ProductProvider } from "./context/productContext";
import ConfigureProductScreen from "./screens/ConfigureProductScreen";
import AddCustomerScreen from "./screens/AddCustomerScreen";
import ConfigureCustomerScreen from "./screens/ConfigureCustomerScreen";
import { CustomerProvider } from "./context/customerContext";
import AddReportScreen from "./screens/AddReportScreen";
import SalesReportScreen from "./screens/SalesReportScreen";
import ExpenseReportScreen from "./screens/ExpenseReportScreen";
import StockReportScreen from "./screens/StockReportScreen";
import { SalesReportProvider } from "./context/salesReportContext";
import SummaryCustomerReportScreen from "./screens/SummaryCustomerReportScreen";
import VerifyEmailScreen from "./screens/VerifyEmailScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import AddExpenseScreen from "./screens/AddExpenseScreen";
import ViewExpenseSummaryScreen from "./screens/ViewExpenseSummaryScreen";
import { ExpenseReportProvider } from "./context/expenseReportContext";
import LowStockReportScreen from "./screens/LowStockReportScreen";
import SplashScreen from "./screens/SplashScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList & RootStackParamList>();
const ProductStack = createNativeStackNavigator<ProductRootStackParamList>();
const CustomerStack = createNativeStackNavigator<CustomerRootStackParamList>();
const PosStack = createNativeStackNavigator<PosRootStackParamList>();
const ReportStack = createNativeStackNavigator<ReportRootStackParamList>();
const ExpenseStack = createNativeStackNavigator<ExpenseRootStackParamList>();

const TabToStackProduct = () => (
  <ProductStack.Navigator>
    <ProductStack.Screen
      name="ProductScreen"
      component={ProductScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
    <ProductStack.Screen
      name="AddProductScreen"
      component={AddProductScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
    <ProductStack.Screen
      name="ConfigureProductScreen"
      component={ConfigureProductScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
  </ProductStack.Navigator>
);

const TabToStackCustomer = () => (
  <CustomerStack.Navigator>
    <CustomerStack.Screen
      name="CustomerScreen"
      component={CustomerScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
    <CustomerStack.Screen
      name="AddCustomerScreen"
      component={AddCustomerScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
    <CustomerStack.Screen
      name="ConfigureCustomerScreen"
      component={ConfigureCustomerScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
  </CustomerStack.Navigator>
);

const TabtoStackPos = () => (
  <PosStack.Navigator>
    <PosStack.Screen
      name="PosScreen"
      component={PosScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
    <PosStack.Screen
      name="AddReportScreen"
      component={AddReportScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
  </PosStack.Navigator>
);

const TabtoStackReport = () => (
  <ReportStack.Navigator>
    <ReportStack.Screen
      name="ReportScreen"
      component={ReportScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
    <ReportStack.Screen
      name="SalesReportScreen"
      component={SalesReportScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
    <ReportStack.Screen
      name="Expenses"
      component={TabToStackExpense}
      options={{ headerShown: false, statusBarHidden: true }}
    />
    <ReportStack.Screen
      name="StockReportScreen"
      component={StockReportScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
    <ReportStack.Screen
      name="SummaryCustomerReportScreen"
      component={SummaryCustomerReportScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
    <ReportStack.Screen
      name="LowStockReportScreen"
      component={LowStockReportScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
  </ReportStack.Navigator>
);

const TabToStackExpense = () => (
  <ExpenseStack.Navigator>
    <ExpenseStack.Screen
      name="ExpenseReportScreen"
      component={ExpenseReportScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
    <ExpenseStack.Screen
      name="AddExpenseScreen"
      component={AddExpenseScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
    <ExpenseStack.Screen
      name="ViewExpenseSummaryScreen"
      component={ViewExpenseSummaryScreen}
      options={{ headerShown: false, statusBarHidden: true }}
    />
  </ExpenseStack.Navigator>
);
const TabNavigator = () => (
  <Tab.Navigator screenOptions={{ tabBarHideOnKeyboard: true }}>
    <Tab.Screen
      name="POS"
      component={TabtoStackPos}
      options={{
        headerShown: true,
        tabBarIcon: () => (
          <MaterialIcons name="add-to-home-screen" size={24} color="pink" />
        ),
        tabBarInactiveTintColor: "black",
        tabBarActiveTintColor: "pink",
        tabBarActiveBackgroundColor: "#3b1b37",
        headerStyle: {
          backgroundColor: "#d49fc0",
        },
        headerTitleAlign: "center",
        headerTintColor: "white",
      }}
    />
    <Tab.Screen
      name="Products"
      component={TabToStackProduct}
      options={{
        headerShown: true,
        tabBarIcon: () => <Entypo name="dropbox" size={24} color="pink" />,
        tabBarInactiveTintColor: "black",
        tabBarActiveTintColor: "pink",
        tabBarActiveBackgroundColor: "#3b1b37",
        headerStyle: {
          backgroundColor: "#d49fc0",
        },
        headerTitleAlign: "center",
        headerTintColor: "white",
      }}
    />
    <Tab.Screen
      name="Customers"
      component={TabToStackCustomer}
      options={{
        headerShown: true,
        tabBarIcon: () => <Fontisto name="persons" size={24} color="pink" />,
        tabBarInactiveTintColor: "black",
        tabBarActiveTintColor: "pink",
        tabBarActiveBackgroundColor: "#3b1b37",
        headerStyle: {
          backgroundColor: "#d49fc0",
        },
        headerTitleAlign: "center",
        headerTintColor: "white",
      }}
    />
    <Tab.Screen
      name="Reports"
      component={TabtoStackReport}
      options={{
        headerShown: true,
        tabBarIcon: () => (
          <MaterialIcons name="view-list" size={24} color="pink" />
        ),
        tabBarInactiveTintColor: "black",
        tabBarActiveTintColor: "pink",
        tabBarActiveBackgroundColor: "#3b1b37",
        headerStyle: {
          backgroundColor: "#d49fc0",
        },
        headerTitleAlign: "center",
        headerTintColor: "white",
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingScreen}
      options={{
        headerShown: true,
        tabBarIcon: () => <FontAwesome name="cog" size={24} color="pink" />,
        tabBarInactiveTintColor: "black",
        tabBarActiveTintColor: "pink",
        tabBarActiveBackgroundColor: "#3b1b37",
        headerStyle: {
          backgroundColor: "#d49fc0",
        },
        headerTitleAlign: "center",
        headerTintColor: "white",
      }}
    />
  </Tab.Navigator>
);

export default function App() {
  return (
    <ExpenseReportProvider>
      <SalesReportProvider>
        <ProductProvider>
          <CustomerProvider>
            <NavigationContainer>
              <Stack.Navigator>
                <Stack.Screen
                  name="SplashScreen"
                  component={SplashScreen}
                  options={{
                    headerShown: false,
                    statusBarHidden: true,
                  }}
                />
                <Stack.Screen
                  name="LogInScreen"
                  component={LogInScreen}
                  options={{
                    headerTitle: "Log In",
                    headerTitleAlign: "center",
                    headerTintColor: "white",
                    headerStyle: {
                      backgroundColor: "#d49fc0",
                    },
                    headerBackVisible: false,
                    gestureEnabled: false,
                    statusBarHidden: true,
                  }}
                />
                <Stack.Screen
                  name="SignUpScreen"
                  component={SignUpScreen}
                  options={{
                    headerTitle: "Sign Up",
                    headerTitleAlign: "center",
                    headerTintColor: "white",
                    headerStyle: {
                      backgroundColor: "#d49fc0",
                    },
                    headerBackVisible: false,
                    statusBarHidden: true,
                  }}
                />
                <Stack.Screen
                  name="VerifyEmailScreen"
                  component={VerifyEmailScreen}
                  options={{
                    headerTitle: "Sign Up",
                    headerTitleAlign: "center",
                    headerTintColor: "white",
                    headerStyle: {
                      backgroundColor: "#d49fc0",
                    },
                    headerBackVisible: false,
                    statusBarHidden: true,
                  }}
                />
                <Stack.Screen
                  name="ForgotPasswordScreen"
                  component={ForgotPasswordScreen}
                  options={{
                    headerTitle: "Sign Up",
                    headerTitleAlign: "center",
                    headerTintColor: "white",
                    headerStyle: {
                      backgroundColor: "#d49fc0",
                    },
                    headerBackVisible: false,
                    statusBarHidden: true,
                  }}
                />
                <Stack.Screen
                  name="HomeScreen"
                  component={TabNavigator}
                  options={{
                    headerShown: false,
                    statusBarHidden: true,
                  }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </CustomerProvider>
        </ProductProvider>
      </SalesReportProvider>
    </ExpenseReportProvider>
  );
}
