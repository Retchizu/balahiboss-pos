import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Product, ProductStackParamList } from "../types/type";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type ProductListProp = {
  data: Product[];
  navigation: NativeStackNavigationProp<
    ProductStackParamList,
    "ProductListScreen"
  >;
};

const ProductList = ({ data, navigation }: ProductListProp) => {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productContainer}
            activeOpacity={0.5}
            onPress={() => navigation.navigate("ProductInfoScreen", item)}
          >
            <Text style={styles.productTitle}>{item.productName}</Text>
            <Text style={styles.productDetail}>Price: ₱{item.sellPrice}</Text>
            <Text style={styles.productDetail}>Stock: {item.stock}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ProductList;

const styles = StyleSheet.create({
  productContainer: {
    borderWidth: wp(0.5),
    borderRadius: wp(1.5),
    borderColor: "#634F40",
    padding: wp(2),
    marginVertical: hp(0.5),
  },
  productTitle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(4),
  },
  productDetail: {
    fontFamily: "SoraRegular",
    fontSize: wp(3.5),
  },
});
