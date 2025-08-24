import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { primary, secondary, strongPrimary } from "@/theme/backgroundTheme";
import SearchBar from "@/components/searchbars/SearchBar";
import useProductsArray from "@/hooks/useProductsArray";
import { useProductContext } from "@/contexts/ProductContext";
import FloatingButton from "@/components/buttons/FloatingButton";
import { router } from "expo-router";
import searchProductsByName from "@/methods/search/searchProductsByName";

const ProductListScreen = () => {
  const [searchBarValue, setSearchBarValue] = React.useState("");
  const { products } = useProductContext();
  const { productsArray } = useProductsArray(products);

  const filteredProducts = searchProductsByName(productsArray, searchBarValue)
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
        value={searchBarValue}
        onChangeText={setSearchBarValue}
        placeholder="Search Products..."
      />
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              marginVertical: hp(0.5),
              borderRadius: wp(2),
              backgroundColor:
                item.stock <= 0 ? "rgba(80,109,132,0.3)" : secondary,
            }}
            activeOpacity={0.7}
            onPress={() => {
              router.navigate(`../${item.id}`);
            }}
          >
            <View
              style={{
                borderColor: "#FF9149",
                borderWidth: wp(0.2),
                borderRadius: wp(3),
              }}
            >
              <Image
                source={
                  item.imageUrl
                    ? { uri: item.imageUrl }
                    : require("../../../assets/balahiboss.png")
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
        )}
        style={{ marginVertical: hp(1) }}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
      />
      <FloatingButton
        onPress={() => {
          router.navigate("../add");
        }}
        icon={{ name: "plus", family: "Entypo", color: "white", size: wp(6) }}
        backgroundColor={strongPrimary}
      />
    </View>
  );
};

export default ProductListScreen;
