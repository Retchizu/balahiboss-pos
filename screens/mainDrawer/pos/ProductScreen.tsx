import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { useProductContext } from "../../../context/ProductContext";
import ProductPOSList from "../../../components/ProductPOSList";
import Searchbar from "../../../components/Searchbar";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { filterSearchForPoduct } from "../../../methods/search-filters/filterSearchForProduct";
import { useSelectedProductContext } from "../../../context/SelectedProductContext";
import Toast from "react-native-toast-message";
import { useUserContext } from "../../../context/UserContext";
import { useProductOnChildAdded } from "../../../hooks/realtime-database-listeners/useProductOnChildAdded";
import { useProductOnChildRemoved } from "../../../hooks/realtime-database-listeners/useProductOnChildRemoved";
import { useProductOnChildChanged } from "../../../hooks/realtime-database-listeners/useProductOnChildChanged";

const ProductScreen = () => {
  const { products, addProduct, setProductList, updateProduct } =
    useProductContext();
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedProducts, addSelectedProduct, deleteSelectedProduct } =
    useSelectedProductContext();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserContext();

  useEffect(() => {
    if (!products.length) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [products]);

  useProductOnChildRemoved(user, products, setProductList);
  useProductOnChildAdded(user, products, addProduct);
  useProductOnChildChanged(user, updateProduct);

  const filteredData = filterSearchForPoduct(products, searchQuery);
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search a product..."
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
        setSearchBarValue={setSearchQuery}
        searchBarValue={searchQuery}
      />
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator color={"#634F40"} size={wp(10)} />
        </View>
      ) : (
        <ProductPOSList
          data={filteredData}
          addSelectedProduct={addSelectedProduct}
          selectedProducts={selectedProducts}
          deleteSelectedProduct={deleteSelectedProduct}
        />
      )}

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
