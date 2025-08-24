import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useSelectedProductContext } from "@/contexts/SelectedProductContext";
import { useProductContext } from "@/contexts/ProductContext";
import SelectedProduct from "@/types/SelectedProduct";
import Product from "@/types/Product";
import { primary, secondary, strongPrimary } from "@/theme/backgroundTheme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { FontAwesome5 } from "@expo/vector-icons";
import CommonButton from "@/components/buttons/CommonButton";

const EditCartScreen = () => {
  const {
    selectedProducts,
    setSelectedProductList,
    deleteSelectedProduct,
    updateSelectedProduct,
  } = useSelectedProductContext();

  const { products } = useProductContext();

  // for additional stock
  const [dummyProducts, setDummyProducts] = useState<Record<string, Product>>(
    {}
  );

  // dummy products
  useEffect(() => {
    const dummyProduct = (): Record<string, Product> => {
      const updated: Record<string, Product> = {};

      for (const selectedProduct of selectedProducts.values()) {
        const product = products[selectedProduct.id];

        if (product) {
          updated[selectedProduct.id] = {
            ...product,
            stock: product.stock + selectedProduct.quantity,
          };
        }
      }

      return updated;
    };
    setDummyProducts({ ...products, ...dummyProduct() });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const computeSubTotal = (item: SelectedProduct) => {
    return item.sellPrice * item.quantity;
  };

  const computeTotal = (items: SelectedProduct[]) => {
    return items.reduce((total, item) => {
      return total + item.sellPrice * item.quantity;
    }, 0);
  };

  const reduceQuantity = (productId: string) => {
    const selected = selectedProducts.get(productId);
    if (!selected) return;

    const newQuantity = Math.max(0.5, selected.quantity - 0.5);
    updateSelectedProduct(productId, { quantity: newQuantity });
  };

  const increaseQuantity = (productId: string, product: Product) => {
    const selected = selectedProducts.get(productId);
    if (!selected) return;
    const newQuantity = Math.min(product.stock, selected.quantity + 0.5);
    updateSelectedProduct(productId, { quantity: newQuantity });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(2),
      }}
    >
      <Text style={{ fontFamily: "Gantari-Medium", fontSize: wp(4) }}>
        Order Details
      </Text>

      <FlatList
        data={Array.from(selectedProducts.values())}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              backgroundColor: secondary,
              alignItems: "center",
              borderRadius: wp(2),
              marginVertical: hp(0.5),
              flex: 1,
            }}
          >
            <TouchableOpacity
              style={{
                marginVertical: hp(0.5),
                flexDirection: "row",
              }}
              activeOpacity={0.7}
              onPress={() => {
                deleteSelectedProduct(item.id);
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
                  source={require("../../../../assets/balahiboss.png")}
                  style={{ height: hp(8), width: wp(16) }}
                />
              </View>
              <View
                style={{
                  gap: hp(2),
                  paddingHorizontal: wp(1),
                }}
              >
                <Text
                  style={{
                    fontFamily: "Gantari-SemiBold",
                    fontSize: wp(4),
                    width: wp(42),
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
                  ₱ {computeSubTotal(item).toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
            {
              //adding and reducing quantity
            }
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: wp(1),
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#60B5FF",
                  padding: wp(1.2),
                  borderRadius: wp(2),
                }}
                activeOpacity={0.7}
                onPress={() => reduceQuantity(item.id)}
              >
                <FontAwesome5 name="minus" size={wp(6)} color="white" />
              </TouchableOpacity>
              <Text
                style={{
                  fontFamily: "Gantari-Regular",
                  fontSize: wp(5),
                  width: wp(17),
                  paddingHorizontal: wp(2),
                  textAlign: "center",
                }}
              >
                {item.quantity}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: strongPrimary,
                  padding: wp(1.2),
                  borderRadius: wp(2),
                }}
                activeOpacity={0.7}
                onPress={() => increaseQuantity(item.id, dummyProducts[item.id])}
              >
                <FontAwesome5 name="plus" size={wp(6)} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View
        style={{
          backgroundColor: primary,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* Shadow Top Border */}
        <View
          style={{
            height: 6,
            backgroundColor: primary,

            // iOS shadow
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,

            // Android shadow
            elevation: 2,
            zIndex: 1,
          }}
        />

        {/* Main Content */}
        <View style={{ padding: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontFamily: "Gantari-SemiBold",
                fontSize: wp(6.5),
              }}
            >
              Total
            </Text>
            <Text
              style={{
                color: strongPrimary,
                fontFamily: "Gantari-Bold",
                fontSize: wp(6.5),
                maxWidth: wp(50),
              }}
            >
              ₱{computeTotal(Array.from(selectedProducts.values())).toFixed(2)}
            </Text>
          </View>
          <CommonButton
            title="Cancel"
            onPress={() => setSelectedProductList(new Map())}
            backgroundColor={primary}
            marginTop={hp(3)}
          />
        </View>
      </View>
    </View>
  );
};

export default EditCartScreen;
