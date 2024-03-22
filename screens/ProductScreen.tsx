import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { ProductRootStackParamList, Product } from "../type";
import { auth, db } from "../firebaseconfig";
import Toast from "react-native-simple-toast";
import { useProductContext } from "../context/productContext";
import { Feather } from "@expo/vector-icons";
import ListComponent from "../components/ListComponent";
type Props = BottomTabScreenProps<ProductRootStackParamList, "ProductScreen">;

const ProductScreen = ({ navigation }: Props) => {
  const { products, setProductList } = useProductContext();
  const [data, setData] = useState<Product[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const user = auth.currentUser;

  const filteredData = useMemo(() => {
    const filteredItems = data.filter((item) =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sortedFilteredItems = filteredItems.sort((a, b) =>
      a.productName.toString().localeCompare(b.productName.toString())
    );

    return sortedFilteredItems;
  }, [data, searchQuery]);

  const deleteData = async (productId: String) => {
    try {
      await db
        .collection("users")
        .doc(user?.uid)
        .collection("products")
        .doc(productId.toString())
        .delete();

      const updatedData = data.filter((item) => item.id !== productId);
      setData(updatedData);
      setProductList(updatedData);
      Toast.show("Product deleted successfully", Toast.SHORT);
    } catch (error) {
      console.error("Error deleting product:", error);
      Toast.show("Error deleting product", Toast.SHORT);
    }
  };

  useEffect(() => {
    setData(products);
  }, [products]);

  return (
    <SafeAreaView style={{ backgroundColor: "#f7f7f7", flex: 1 }}>
      <ListComponent
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        navigation={navigation}
        placeholder="Search Product"
        identifier="product"
        navigateTo="AddProductScreen"
      />
      <FlatList
        data={filteredData}
        renderItem={({ item }) => (
          <View
            style={{
              flex: 1,
              paddingHorizontal: 10,
              paddingVertical: 10,
              borderColor: "#d49fc0",
              borderWidth: 5,
              borderRadius: 5,
              marginVertical: 5,
              marginHorizontal: 10,
              backgroundColor: item.stock === 0 ? "#bab8ba" : "white",
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ConfigureProductScreen", { item })
                  }
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      width: 300,
                      maxWidth: "90%",
                    }}
                  >
                    {item.productName}
                  </Text>
                  <Text>Price: ₱{item.sellPrice.toString()}</Text>
                  <Text>Stock: {item.stock.toString()}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{ alignSelf: "center" }}
                onPress={() => deleteData(item.id)}
              >
                <Feather name="trash-2" size={30} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default ProductScreen;

const styles = StyleSheet.create({});
