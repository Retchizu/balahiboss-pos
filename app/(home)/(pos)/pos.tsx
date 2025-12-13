import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { primary, secondary, strongPrimary } from "@/theme/backgroundTheme";
import SearchBar from "@/components/searchbars/SearchBar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Product from "@/types/Product";
import { useSelectedProductContext } from "@/contexts/SelectedProductContext";
import useProductsArray from "@/hooks/useProductsArray";
import { usePendingOrderContext } from "@/contexts/PendingOrderContext";
import { endOfDay, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import {
  collection,
  onSnapshot,
  query as fsQuery,
  where,
  orderBy,
  query,
} from "firebase/firestore";
import { firestoreDb } from "@/config/firebaseConfig";
import searchProductsByName from "@/methods/search/searchProductsByName";
import useBluetoothPrinter, {
  permissionForPrint,
} from "@/hooks/useBluetoothPrinter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import PendingOrder from "@/types/PendingOrder";
import { useProductContext } from "@/contexts/ProductContext";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useCustomerContext } from "@/contexts/CustomerContext";
import { api } from "@/config/axios-api";
import { useRecentTrasactionContext } from "@/contexts/RecentTransactionContext";

const PosScreen = () => {
  const { products, setProducts } = useProductContext();
  const { setCustomers } = useCustomerContext();
  const { productsArray } = useProductsArray(products);

  const { setRecentTranscations } = useRecentTrasactionContext();

  // search bar
  const [searchQuery, setSearchQuery] = useState("");
  const filteredProducts = useMemo(() => {
    return searchProductsByName(productsArray, searchQuery);
  }, [productsArray, searchQuery]);

  const { deleteSelectedProduct, addSelectedProduct, selectedProducts } =
    useSelectedProductContext();
  // allow quantity updates from the POS list
  const { updateSelectedProduct } = useSelectedProductContext();

  // Only show loading if no products exist (allows immediate interaction if data exists)
  const [loading, setLoading] = useState(Object.keys(products).length === 0);

  // Load initial data immediately (non-blocking)
  useEffect(() => {
    let isMounted = true;
    let hasLoadedInitial = false;

    const loadInitialData = async () => {
      try {
        // Load products and transactions in parallel for faster initial load
        const [productResponse, transactionResponse] = await Promise.all([
          api.get("/product/list"),
          api.get("/transaction/list"),
        ]);

        if (isMounted) {
          setProducts(productResponse.data.items);
          setRecentTranscations(transactionResponse.data.items);
          setLoading(false);
          hasLoadedInitial = true;
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        if (isMounted) {
          setLoading(false);
          hasLoadedInitial = true;
        }
      }
    };

    // Start loading immediately (non-blocking)
    loadInitialData();

    // Set up Firestore listener for real-time updates (separate from initial load)
    let debounceTimer: NodeJS.Timeout | null = null;
    let isFirstSnapshot = true;

    const q = query(
      collection(firestoreDb, "products"),
      where("deleted", "==", false)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        // Skip first snapshot - we're already loading initial data
        if (isFirstSnapshot) {
          isFirstSnapshot = false;
          // If initial load already completed, process this snapshot
          if (!hasLoadedInitial) {
            return;
          }
        }

        // Only process updates after initial load completes
        if (!hasLoadedInitial) {
          return;
        }

        // Debounce to prevent excessive API calls
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(async () => {
          try {
            const productResponse = await api.get("/product/list");
            const transactionResponse = await api.get("/transaction/list");
            if (isMounted) {
              setProducts(productResponse.data.items);
              setRecentTranscations(transactionResponse.data.items);
            }
          } catch (error) {
            console.error("Error updating products:", error);
          }
        }, 1000); // 500ms debounce for updates
      },
      (error) => {
        console.error("Products listener error:", error);
        if (isMounted && !hasLoadedInitial) {
          setLoading(false);
          hasLoadedInitial = true;
        }
      }
    );

    return () => {
      isMounted = false;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      unsubscribe();
    };
  }, [setProducts, setRecentTranscations]);

  // Optimized customers listener - load initial data immediately
  useEffect(() => {
    let isMounted = true;
    let debounceTimer: NodeJS.Timeout | null = null;
    let isFirstSnapshot = true;

    // Load initial customers immediately (non-blocking)
    const loadInitialCustomers = async () => {
      try {
        const response = await api.get("/customer/list");
        if (isMounted) {
          setCustomers(response.data.items);
        }
      } catch (error) {
        console.error("Error loading customers:", error);
      }
    };

    loadInitialCustomers();

    // Set up Firestore listener for real-time updates
    const q = query(
      collection(firestoreDb, "customers"),
      where("deleted", "==", false)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        // Skip first snapshot
        if (isFirstSnapshot) {
          isFirstSnapshot = false;
          return;
        }

        // Debounce updates
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(async () => {
          try {
            const response = await api.get("/customer/list");
            if (isMounted) {
              setCustomers(response.data.items);
            }
          } catch (error) {
            console.error("Error updating customers:", error);
          }
        }, 1000);
      },
      (error) => {
        console.error("Customers listener error:", error);
      }
    );

    return () => {
      isMounted = false;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      unsubscribe();
    };
  }, [setCustomers]);

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

      const selected = selectedProducts.get(item.id);
      return (
        <TouchableOpacity
          style={{
            flexDirection: "row",
            marginVertical: hp(0.5),
            borderRadius: wp(2),
            backgroundColor: productCardViewBackgroundColor(item),
            alignItems: "center",
            position: "relative", // allow absolute positioned quantity controls
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

          {/* floating quantity controls */}
          {selected && (
            <View
              style={{
                position: "absolute",
                right: wp(3),
                top: hp(1.2),
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.98)",
                paddingHorizontal: wp(2),
                paddingVertical: hp(0.6),
                borderRadius: wp(3),
                borderWidth: 0.6,
                borderColor: "#E5E7EB",
                // stronger shadow for prominence
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 6,
                zIndex: 20,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  const qty = selected.quantity;
                  if (qty <= 0.5) {
                    deleteSelectedProduct(item.id);
                  } else {
                    const newQty = Math.max(0.5, qty - 0.5);
                    updateSelectedProduct(item.id, { quantity: newQty });
                  }
                }}
                style={{
                  padding: wp(1.4),
                  borderRadius: wp(1.6),
                  backgroundColor: "#60B5FF",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FontAwesome5 name="minus" size={wp(4.8)} color="white" />
              </TouchableOpacity>

              <Text
                style={{
                  fontFamily: "Gantari-SemiBold",
                  fontSize: wp(5),
                  marginHorizontal: wp(3),
                  minWidth: wp(8),
                  textAlign: "center",
                }}
              >
                {selected.quantity}
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  const qty = selected.quantity;
                  const newQty = Math.min(item.stock, qty + 0.5);
                  updateSelectedProduct(item.id, { quantity: newQty });
                }}
                style={{
                  padding: wp(1.4),
                  borderRadius: wp(1.6),
                  backgroundColor: strongPrimary,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FontAwesome5 name="plus" size={wp(4.8)} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [
      addSelectedProduct,
      deleteSelectedProduct,
      selectedProducts,
      updateSelectedProduct,
    ]
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

    const pendingOrdersRef = fsQuery(
      collection(firestoreDb, "pendingOrders"),
      orderBy("date"),
      where("date", ">=", startUtc),
      where("date", "<=", endUtc)
    );

    const unsubscribe = onSnapshot(
      pendingOrdersRef,
      (snapshot) => {
        const pendingOrders: Record<string, PendingOrder> = {};
        snapshot.docs.forEach((doc) => {
          pendingOrders[doc.id] = doc.data() as PendingOrder;
        });

        const normalizedOrders: Record<string, PendingOrder> =
          Object.fromEntries(
            Object.entries(pendingOrders).map(([id, order]) => [
              id,
              {
                ...order,
                checkedBy: order.checkedBy ?? [],
              },
            ])
          );

        setOrders(normalizedOrders);
      },
      (error) => {
        console.error("pendingOrders listener error:", error);
      }
    );

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
    // show centered spinner while loading, otherwise original UI
    loading ? (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: primary,
        }}
      >
        <ActivityIndicator size="large" color="#FF9149" />
      </View>
    ) : (
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
    )
  );
};

export default PosScreen;
