import { FlatList, TouchableOpacity, View, Text, Image } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { primary, secondary } from "@/theme/backgroundTheme";
import SearchBar from "@/components/searchbars/SearchBar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import useGetProducts from "@/hooks/useGetProducts";
import Product from "@/types/Product";
import { useSelectedProductContext } from "@/contexts/SelectedProductContext";
import useGetCustomers from "@/hooks/useGetCustomers";
import useProductsArray from "@/hooks/useProductsArray";
import { usePendingOrderContext } from "@/contexts/PendingOrderContext";
import { endOfDay, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import {
  endAt,
  onValue,
  orderByChild,
  query,
  ref,
  startAt,
} from "firebase/database";
import { db } from "@/config/firebaseConfig";
import searchProductsByName from "@/methods/search/searchProductsByName";
import { useUserContext } from "@/contexts/UserContext";
import useBluetoothPrinter, {
  permissionForPrint,
} from "@/hooks/useBluetoothPrinter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import PendingOrder from "@/types/PendingOrder";
const PosScreen = () => {
  const { role } = useUserContext();
  console.log(role);
  const { products } = useGetProducts();
  const { productsArray } = useProductsArray(products);
  // search bar
  const [searchQuery, setSearchQuery] = useState("");
  const filteredProducts = useMemo(() => {
    return searchProductsByName(productsArray, searchQuery);
  }, [productsArray, searchQuery]);

  // fetch customer right away
  useGetCustomers();
  const { deleteSelectedProduct, addSelectedProduct, selectedProducts } =
    useSelectedProductContext();

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
              : () =>
                  Toast.show({
                    type: "error",
                    text1: `${item.productName} is out of stock.`,
                  })
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
                color:
                  item.stock <= 0
                    ? "rgba(80,109,132,0.8)"
                    : selectedProducts.has(item.id)
                    ? "#0077ffff"
                    : "black",
              }}
            >
              {item.productName}
            </Text>
            <Text
              style={{
                fontFamily: "Gantari-Regular",
                color: "black",
                fontSize: wp(4),
              }}
            >
              Price: ₱{item.sellPrice.toFixed(2)}
            </Text>
            <Text
              style={{
                fontFamily: "Gantari-Regular",
                color: "black",
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

  // get the pending orders
  const { setOrders } = usePendingOrderContext();
  useEffect(() => {
    const timeZone = "Asia/Manila";
    const now = new Date();

    // Get start & end of day in PHT, then convert to UTC for comparison
    const startPHT = startOfDay(toZonedTime(now, timeZone));
    const endPHT = endOfDay(toZonedTime(now, timeZone));

    const startUtc = fromZonedTime(startPHT, timeZone).toISOString();
    const endUtc = fromZonedTime(endPHT, timeZone).toISOString();

    const pendingOrdersRef = query(
      ref(db, "pendingOrders"),
      orderByChild("date"),
      startAt(startUtc),
      endAt(endUtc)
    );

    const unsubscribe = onValue(pendingOrdersRef, (snapshot) => {
      const pendingOrders: Record<string, PendingOrder> = snapshot.val() || {};

      // normalize each order
      const normalizedOrders: Record<string, PendingOrder> = Object.fromEntries(
        Object.entries(pendingOrders).map(([id, order]) => [
          id,
          {
            ...order,
            checkedBy: order.checkedBy ?? [], // ensure array
          },
        ])
      );

      setOrders(normalizedOrders);
    });

    return () => unsubscribe();
  }, [setOrders]);

  const { pairDevice } = useBluetoothPrinter();

  useEffect(() => {
    const pairSavedPrinter = async () => {
      try {
        const permission = await permissionForPrint();
        const savedCurrentPrinter = await AsyncStorage.getItem("printer");
        if (permission && savedCurrentPrinter) {
          const printer = JSON.parse(savedCurrentPrinter);
          await pairDevice(printer.address);
          console.log("Paired Successfully");
        }
      } catch (error) {
        console.error(error);
      }
    };

    pairSavedPrinter();
  }, [pairDevice]);

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
        onChangeText={setSearchQuery}
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
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

export default PosScreen;
