import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { getProductData } from "../../../methods/data-methods/getProductData";
import { useProductContext } from "../../../context/ProductContext";
import ProductPOSList from "../../../components/ProductPOSList";
import Searchbar from "../../../components/Searchbar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { filterSearchForPoduct } from "../../../methods/search-filters/filterSearchForProduct";
import { useSelectedProductContext } from "../../../context/SelectedProductContext";
import Toast from "react-native-toast-message";
import { useToastContext } from "../../../context/ToastContext";

const ProductScreen = () => {
  const { products, setProductList } = useProductContext();
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedProducts, addSelectedProduct, setSelectedProductList } =
    useSelectedProductContext();
  const { showToast } = useToastContext();
  useEffect(() => {
    getProductData(setProductList);
  }, []);

  const filteredData = filterSearchForPoduct(products, searchQuery);
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search a product..."
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />
      <ProductPOSList
        data={filteredData}
        addSelectedProduct={addSelectedProduct}
        selectedProducts={selectedProducts}
        setSelectedProductList={setSelectedProductList}
      />
      <Toast position="bottom" autoHide visibilityTime={2000} />
    </View>
  );
};

export default ProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0E9",
    paddingHorizontal: wp(5),
  },
});
