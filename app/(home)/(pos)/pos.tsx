import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import ModalTemplate from "@/components/modals/ModalTemplate";
import CommonButton from "@/components/buttons/CommonButton";
import SearchBar from "@/components/searchbars/SearchBar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Product from "@/types/Product";
import Customer from "@/types/Customer";
import Category from "@/types/Category";
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
  limit,
} from "firebase/firestore";
import { firestoreDb } from "@/config/firebaseConfig";
import searchProductsByName from "@/methods/search/searchProductsByName";
import Toast from "react-native-toast-message";
import PendingOrder from "@/types/PendingOrder";
import { useProductContext } from "@/contexts/ProductContext";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useCustomerContext } from "@/contexts/CustomerContext";
import { api } from "@/config/axios-api";
import { useRecentTransactionContext } from "@/contexts/RecentTransactionContext";

const PosScreen = () => {
  const { primary, secondary, strongPrimary, textOnPrimary, textMuted, textOnStrongPrimary } =
    useTheme();
  const { products, setProducts } = useProductContext();
  const { setCustomers } = useCustomerContext();
  const { productsArray } = useProductsArray(products);

  const { setRecentTransactions } = useRecentTransactionContext();

  // categories state
  const [categories, setCategories] = useState<Record<string, Category>>({});

  // category filter state - multi-select using Set
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [isCategoryFilterModalVisible, setIsCategoryFilterModalVisible] = useState(false);

  // search bar
  const [searchQuery, setSearchQuery] = useState("");
  const filteredProducts = useMemo(() => {
    let filtered = searchProductsByName(productsArray, searchQuery);
    
    // Filter by category if categories are selected
    if (selectedCategoryIds.size > 0) {
      filtered = filtered.filter((product) => {
        if (!product.categoryIds || product.categoryIds.length === 0) {
          return false;
        }
        // Check if product has at least one of the selected categories
        return product.categoryIds.some((categoryId) =>
          selectedCategoryIds.has(categoryId)
        );
      });
    }
    
    return filtered;
  }, [productsArray, searchQuery, selectedCategoryIds]);

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
          api.get("/products"),
          api.get("/transactions"),
        ]);

        if (isMounted) {
          setProducts(productResponse.data.items);
          setRecentTransactions(transactionResponse.data.items);
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

    // Set up Firestore listener for real-time product updates (no full refetch)
    const q = query(
      collection(firestoreDb, "products"),
      where("deleted", "==", false),
      orderBy("updatedAt", "desc"),
      limit(10),
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        // Only process updates after initial load completes
        if (!hasLoadedInitial || !isMounted) {
          return;
        }
       const response = await api.get("/transactions");
        setRecentTransactions(response.data.items);
        // Merge real-time changes into existing products without refetching all
        setProducts((prevProducts) => {
          const updatedProducts = { ...prevProducts };

          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data() as Product;
            const id = change.doc.id;

            if (change.type === "removed" || data.deleted) {
              delete updatedProducts[id];
            } else {
              updatedProducts[id] = {
                ...(updatedProducts[id] ?? {}),
                ...data,
                id,
              };
            }
          });

          return updatedProducts;
        });
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
      unsubscribe();
    };
    }, [setProducts, setRecentTransactions]);

  // Optimized customers listener - load initial data immediately
  useEffect(() => {
    let isMounted = true;
    let hasLoadedInitialCustomers = false;

    // Load initial customers immediately (non-blocking)
    const loadInitialCustomers = async () => {
      try {
        const response = await api.get("/customers");
        if (isMounted) {
          setCustomers(response.data.items);
          hasLoadedInitialCustomers = true;
        }
      } catch (error) {
        console.error("Error loading customers:", error);
        if (isMounted) {
          hasLoadedInitialCustomers = true;
        }
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
      (snapshot) => {
        // Only process updates after initial load completes
        if (!hasLoadedInitialCustomers || !isMounted) {
          return;
        }

        // Merge real-time changes into existing customers without refetching all
        setCustomers((prevCustomers) => {
          const updatedCustomers = { ...prevCustomers };

          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data() as Customer;
            const id = change.doc.id;

            if (change.type === "removed" || data.deleted) {
              delete updatedCustomers[id];
            } else {
              updatedCustomers[id] = {
                ...(updatedCustomers[id] ?? {}),
                ...data,
                id,
              };
            }
          });

          return updatedCustomers;
        });
      },
      (error) => {
        console.error("Customers listener error:", error);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setCustomers]);

  // Fetch categories from Firestore
  useEffect(() => {
    const categoriesCollectionRef = query(
      collection(firestoreDb, "categories"),
      orderBy("displayOrder", "asc")
    );

    const unsubscribe = onSnapshot(
      categoriesCollectionRef,
      (snapshot) => {
        const categoriesData: Record<string, Category> = {};
        snapshot.docs.forEach((doc) => {
          categoriesData[doc.id] = {
            id: doc.id,
            ...doc.data(),
          } as Category;
        });
        setCategories(categoriesData);
      },
      (error) => {
        console.error("Error listening to categories:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Helper function to get category names for a product
  const getProductCategories = useCallback(
    (product: Product): Category[] => {
      if (!product.categoryIds || product.categoryIds.length === 0) {
        return [];
      }
      return product.categoryIds
        .map((categoryId) => categories[categoryId])
        .filter((category): category is Category => category !== undefined);
    },
    [categories]
  );

  // Helper function to get category background color with opacity
  const getCategoryBackgroundColor = useCallback((color?: string): string => {
    if (!color) return "rgba(175, 221, 255, 0.3)";
    // If hex color, add opacity
    if (color.startsWith("#") && color.length === 7) {
      return `${color}33`; // Add 20% opacity (33 in hex)
    }
    // Fallback for other color formats
    return "rgba(175, 221, 255, 0.3)";
  }, []);

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

        return "rgba(255,255,255,0.85)";
      };

      const selected = selectedProducts.get(item.id);
      return (
        <TouchableOpacity
          style={{
            flexDirection: "row",
            marginVertical: hp(0.5),
            borderRadius: wp(2),
            backgroundColor: productCardViewBackgroundColor(item),
            borderWidth: 1,
            borderColor: textMuted,
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
              height: hp(8),
              width: wp(16),
            }}
          >
            <Image
              source={
                item.imageUrl
                  ? { uri: item.imageUrl }
                  : require("../../../assets/balahiboss.png")
              }
              style={{ height: hp(8), width: wp(16), borderRadius: wp(2)}}
              resizeMode="cover"
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
            {getProductCategories(item).length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginTop: hp(0.3),
                  marginBottom: hp(0.2),
                }}
              >
                {getProductCategories(item).map((category) => (
                  <View
                    key={category.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: getCategoryBackgroundColor(category.color),
                      paddingHorizontal: wp(2),
                      paddingVertical: hp(0.2),
                      borderRadius: wp(1.5),
                      marginRight: wp(1.5),
                      marginBottom: hp(0.2),
                    }}
                  >
                    {category.color && (
                      <View
                        style={{
                          width: wp(2),
                          height: wp(2),
                          borderRadius: wp(1),
                          backgroundColor: category.color,
                          marginRight: wp(1),
                        }}
                      />
                    )}
                    <Text
                      style={{
                        fontFamily: "Gantari-Regular",
                        fontSize: wp(3.2),
                        color: textOnStrongPrimary,
                      }}
                    >
                      {category.categoryName}
                    </Text>
                  </View>
                ))}
              </View>
            )}
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
                color: textOnStrongPrimary,
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
    [selectedProducts, textMuted, getProductCategories, textOnStrongPrimary, strongPrimary, deleteSelectedProduct, addSelectedProduct, getCategoryBackgroundColor, updateSelectedProduct]
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
        <View style={{ flexDirection: "row", gap: wp(2), alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search Products..."
            />
          </View>
          <TouchableOpacity
            style={{
              padding: wp(3),
              borderRadius: wp(4),
              backgroundColor: secondary,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setIsCategoryFilterModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="funnel"
              size={wp(5.5)}
              color={textOnPrimary}
            />
          </TouchableOpacity>
        </View>

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

        {/* Category Filter Modal */}
        <ModalTemplate
          visible={isCategoryFilterModalVisible}
          onClose={() => setIsCategoryFilterModalVisible(false)}
          height={hp(50)}
          width={wp(90)}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: wp(3),
              marginBottom: hp(2),
              paddingHorizontal: wp(1),
            }}
          >
            <Ionicons name="funnel" size={wp(7)} color={strongPrimary} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Gantari-Bold",
                  fontSize: wp(4.4),
                  color: textOnPrimary,
                }}
              >
                Filter by Category
              </Text>
              <Text
                style={{
                  fontFamily: "Gantari-Regular",
                  fontSize: wp(3.4),
                  color: textMuted,
                  marginTop: hp(0.2),
                }}
              >
                Filter products by category.
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: hp(1) }}
            style={{ maxHeight: hp(30) }}
          >
            {/* All Categories Option */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: hp(1.5),
                paddingHorizontal: wp(2),
                borderRadius: wp(2),
                backgroundColor:
                  selectedCategoryIds.size === 0
                    ? "rgba(175, 221, 255, 0.3)"
                    : "transparent",
                marginBottom: hp(0.5),
              }}
              onPress={() => setSelectedCategoryIds(new Set())}
              activeOpacity={0.7}
            >
              <Checkbox
                value={selectedCategoryIds.size === 0}
                onValueChange={() => setSelectedCategoryIds(new Set())}
                color={selectedCategoryIds.size === 0 ? strongPrimary : undefined}
              />
              <Text
                style={{
                  fontFamily: "Gantari-Regular",
                  fontSize: wp(4),
                  color: textOnPrimary,
                  marginLeft: wp(3),
                }}
              >
                All Categories
              </Text>
            </TouchableOpacity>

            {/* Category Options */}
            {Object.values(categories)
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
              .map((category) => {
                const isSelected = selectedCategoryIds.has(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: hp(1.5),
                      paddingHorizontal: wp(2),
                      borderRadius: wp(2),
                      backgroundColor: isSelected
                        ? getCategoryBackgroundColor(category.color)
                        : "transparent",
                      marginBottom: hp(0.5),
                    }}
                    onPress={() => {
                      setSelectedCategoryIds((prev) => {
                        const newSet = new Set(prev);
                        if (newSet.has(category.id)) {
                          newSet.delete(category.id);
                        } else {
                          newSet.add(category.id);
                        }
                        return newSet;
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <Checkbox
                      value={isSelected}
                      onValueChange={() => {
                        setSelectedCategoryIds((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has(category.id)) {
                            newSet.delete(category.id);
                          } else {
                            newSet.add(category.id);
                          }
                          return newSet;
                        });
                      }}
                      color={isSelected ? strongPrimary : undefined}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginLeft: wp(3),
                        flex: 1,
                      }}
                    >
                      {category.color && (
                        <View
                          style={{
                            width: wp(3),
                            height: wp(3),
                            borderRadius: wp(1.5),
                            backgroundColor: category.color,
                            marginRight: wp(2),
                          }}
                        />
                      )}
                      <Text
                        style={{
                          fontFamily: "Gantari-Regular",
                          fontSize: wp(4),
                          color: textOnPrimary,
                        }}
                      >
                        {category.categoryName}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>

          <View
            style={{
              marginTop: hp(2),
              flexDirection: "row",
              justifyContent: "space-between",
              gap: wp(3),
            }}
          >
            <CommonButton
              title="Clear"
              onPress={() => {
                setSelectedCategoryIds(new Set());
                setIsCategoryFilterModalVisible(false);
              }}
              backgroundColor="#F3F4F6"
              titleColor={textOnStrongPrimary}
              marginTop={0}
            />
            <CommonButton
              title="Apply"
              onPress={() => setIsCategoryFilterModalVisible(false)}
              backgroundColor={strongPrimary}
              titleColor="white"
              marginTop={0}
            />
          </View>
        </ModalTemplate>
      </View>
    )
  );
};

export default PosScreen;
