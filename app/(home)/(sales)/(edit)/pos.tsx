import { FlatList, TouchableOpacity, View, Text, Image } from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import { primary, secondary } from "@/theme/backgroundTheme";
import SearchBar from "@/components/searchbars/SearchBar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import useGetProducts from "@/hooks/useGetProducts";
import Product from "@/types/Product";
import { useSelectedProductContext } from "@/contexts/SelectedProductContext";
import useProductsArray from "@/hooks/useProductsArray";

const EditPosScreen = () => {
  const { products } = useGetProducts();
  const { productsArray } = useProductsArray(products);
  const { deleteSelectedProduct, addSelectedProduct, selectedProducts } =
    useSelectedProductContext();

  console.log(selectedProducts);
  // prevents re-render unless depencies have changed
  const renderProductList = useCallback(
    ({ item }: { item: Product }) => {
      const productCardViewBackgroundColor = (item: Product) => {
        if (item.stock <= 0) {
          return "rgba(80,109,132,0.3)";
        }

        if (selectedProducts.has(item.id)) {
          return "#AFDDFF";
        }

        return secondary;
      };

      return (
        <TouchableOpacity
          style={{
            flexDirection: "row",
            marginVertical: hp(0.5),
            borderRadius: wp(2),
            backgroundColor: productCardViewBackgroundColor(item),
            alignItems: "center",
          }}
          activeOpacity={0.7}
          onPress={
            item.stock > 0
              ? () => {
                  if (selectedProducts.has(item.id)) {
                    deleteSelectedProduct(item.id);
                  } else {
                    console.log(item.id);
                    addSelectedProduct({
                      ...item,
                      quantity: item.stock === 0.5 ? 0.5 : 1,
                    });
                  }
                }
              : () => console.log("Out of stock")
          }
        >
          <View
            style={{
              borderColor: "#FF9149",
              borderWidth: wp(0.2),
              height: hp(8),
              width: wp(16),
              borderRadius: wp(3),
            }}
          >
            <Image
              source={
                item.imageUrl
                  ? { uri: item.imageUrl }
                  : require("../../../../assets/balahiboss.png")
              }
              style={{ height: hp(8), width: wp(16), borderRadius: wp(3) }}
            />
          </View>
          <View style={{ maxWidth: wp(60), paddingHorizontal: wp(1.5) }}>
            <Text
              style={{
                fontFamily: "Gantari-SemiBold",
                fontSize: wp(4.5),
              }}
            >
              {item.productName}
            </Text>
            <Text
              style={{
                fontFamily: "Gantari-Regular",
                color: "#FF9149",
                fontSize: wp(4),
              }}
            >
              Price: ₱{item.sellPrice.toFixed(2)}
            </Text>
            <Text
              style={{
                fontFamily: "Gantari-Regular",
                fontSize: wp(4),
              }}
            >
              Stock: {item.stock}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [addSelectedProduct, deleteSelectedProduct, selectedProducts]
  );

  // searchbar
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(
    () =>
      productsArray.filter((product) =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [productsArray, searchQuery]
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(2),
      }}
    >
      <SearchBar
        value={searchQuery}
        onChangeText={(text) => {setSearchQuery(text)}}
        placeholder="Search Products..."
      />

      <FlatList
        data={filteredProducts}
        renderItem={renderProductList}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        style={{ marginTop: hp(1) }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default EditPosScreen;
