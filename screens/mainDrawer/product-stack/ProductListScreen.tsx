import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Fontisto from "@expo/vector-icons/Fontisto";
import Searchbar from "../../../components/Searchbar";
import { ProductListScreenProp } from "../../../types/type";
import ProductList from "../../../components/ProductList";
import { useProductContext } from "../../../context/ProductContext";
import { filterSearchForPoduct } from "../../../methods/search-filters/filterSearchForProduct";
import { useCurrentProductContext } from "../../../context/CurrentProductContext";

const ProductListScreen = ({ navigation }: ProductListScreenProp) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { products } = useProductContext();
  const filteredData = filterSearchForPoduct(products, searchQuery);
  const { setCurrentProduct } = useCurrentProductContext();
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Searchbar
          placeholder="Search product..."
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
          setSearchBarValue={setSearchQuery}
          searchBarValue={searchQuery}
        />
        <TouchableOpacity
          style={{ padding: wp(2) }}
          onPress={() => navigation.navigate("AddProductScreen")}
        >
          <Fontisto name="shopping-basket-add" size={24} color="#634F40" />
        </TouchableOpacity>
      </View>
      <ProductList
        data={filteredData}
        navigation={navigation}
        setCurrentProduct={setCurrentProduct}
      />
    </View>
  );
};

export default ProductListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0E9",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: wp(10),
  },
});
