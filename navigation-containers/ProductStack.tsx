import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProductStackParamList } from "../types/type";
import EditProductScreen from "../screens/product-stack/EditProductScreen";
import ProductListScreen from "../screens/product-stack/ProductListScreen";
import ProductInfoScreen from "../screens/product-stack/ProductInfoScreen";
import AddProductScreen from "../screens/product-stack/AddProductScreen";

const ProductStack = createNativeStackNavigator<ProductStackParamList>();

export const ProductStackScreen = () => (
  <ProductStack.Navigator
    initialRouteName="ProductListScreen"
    screenOptions={{ headerShown: false }}
  >
    <ProductStack.Screen
      name="ProductListScreen"
      component={ProductListScreen}
    />
    <ProductStack.Screen name="AddProductScreen" component={AddProductScreen} />
    <ProductStack.Screen
      name="EditProductScreen"
      component={EditProductScreen}
    />
    <ProductStack.Screen
      name="ProductInfoScreen"
      component={ProductInfoScreen}
    />
  </ProductStack.Navigator>
);
