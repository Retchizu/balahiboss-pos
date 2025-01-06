import { StyleSheet, View } from "react-native";
import { useState } from "react";
import Searchbar from "../../../../components/Searchbar";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import ProductPOSList from "../../../../components/ProductPOSList";

import { useSelectedProductInEditContext } from "../../../../context/SelectedProductInEditContext";
import { filterSearchForPoduct } from "../../../../methods/search-filters/filterSearchForProduct";
import { useProductInEditContext } from "../../../../context/ProductInEditContext";

const ProductListEditCustomerReportScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    selectedProductsInEdit,
    addSelectedProductInEdit,
    deleteSelectedProductInEdit,
  } = useSelectedProductInEditContext();

  const { productsInEdit } = useProductInEditContext();
  const filteredProductData = filterSearchForPoduct(
    productsInEdit,
    searchQuery
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search a product..."
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
        setSearchBarValue={setSearchQuery}
        searchBarValue={searchQuery}
      />
      <ProductPOSList
        selectedProducts={selectedProductsInEdit}
        addSelectedProduct={addSelectedProductInEdit}
        deleteSelectedProduct={deleteSelectedProductInEdit}
        data={filteredProductData}
      />
    </View>
  );
};

export default ProductListEditCustomerReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0E9",
    paddingHorizontal: wp(5),
  },
});
