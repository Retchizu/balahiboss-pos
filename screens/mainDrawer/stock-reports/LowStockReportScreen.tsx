import { FlatList, StyleSheet, Text, View } from "react-native";
import { useCallback, useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useProductContext } from "../../../context/ProductContext";
import { filterLowStockProducts } from "../../../methods/filterLowStockProducts";
import Searchbar from "../../../components/Searchbar";
import { filterSearchForPoduct } from "../../../methods/search-filters/filterSearchForProduct";
import { Product } from "../../../types/type";
const LowStockReportScreen = () => {
  const { products } = useProductContext();
  const lowStockProducts = filterLowStockProducts(products);
  const [searchQuery, setSearchQuery] = useState("");
  const filteredLowStockProduct = filterSearchForPoduct(
    lowStockProducts,
    searchQuery
  );

  const renderLoswStockReports = useCallback(
    ({ item }: { item: Product }) => (
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: wp(0.3),
          marginVertical: hp(0.2),
        }}
      >
        <Text style={[styles.valueStyle, { flex: 1 }]}>{item.productName}</Text>
        <Text
          style={[
            styles.valueStyle,
            { color: item.stock === 0 ? "red" : "black" },
          ]}
        >
          {item.stock}
        </Text>
      </View>
    ),
    [products]
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search a product..."
        onChangeText={(text) => setSearchQuery(text)}
        value={searchQuery}
        setSearchBarValue={setSearchQuery}
        searchBarValue={searchQuery}
      />
      <FlatList
        data={filteredLowStockProduct}
        renderItem={renderLoswStockReports}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    </View>
  );
};

export default LowStockReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0E9",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
  },
  valueStyle: {
    fontFamily: "SoraMedium",
    fontSize: wp(3.8),
  },
});
