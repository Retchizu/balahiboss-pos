import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProductStackParamList } from "../types/type";
import ProductListScreen from "../screens/mainDrawer/product-stack/ProductListScreen";
import EditProductScreen from "../screens/mainDrawer/product-stack/EditProductScreen";
import ProductInfoScreen from "../screens/mainDrawer/product-stack/ProductInfoScreen";
import AddProductScreen from "../screens/mainDrawer/product-stack/AddProductScreen";
import { CurrentProductProvider } from "../context/CurrentProductContext";

const ProductStack = createNativeStackNavigator<ProductStackParamList>();

export const ProductStackScreen = () => (
  <CurrentProductProvider>
    <ProductStack.Navigator
      initialRouteName="ProductListScreen"
      screenOptions={{ headerShown: false }}
    >
      <ProductStack.Screen
        name="ProductListScreen"
        component={ProductListScreen}
      />
      <ProductStack.Screen
        name="AddProductScreen"
        component={AddProductScreen}
      />
      <ProductStack.Screen
        name="EditProductScreen"
        component={EditProductScreen}
      />
      <ProductStack.Screen
        name="ProductInfoScreen"
        component={ProductInfoScreen}
      />
    </ProductStack.Navigator>
  </CurrentProductProvider>
);
