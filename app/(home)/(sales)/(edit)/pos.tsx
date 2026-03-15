import { FlatList, TouchableOpacity, View, Text, Image, ScrollView } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import SearchBar from "@/components/searchbars/SearchBar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Product from "@/types/Product";
import Category from "@/types/Category";
import { useSelectedProductContext } from "@/contexts/SelectedProductContext";
import useProductsArray from "@/hooks/useProductsArray";
import { useProductContext } from "@/contexts/ProductContext";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import ModalTemplate from "@/components/modals/ModalTemplate";
import CommonButton from "@/components/buttons/CommonButton";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { firestoreDb } from "@/config/firebaseConfig";
import searchProductsByName from "@/methods/search/searchProductsByName";

const EditPosScreen = () => {
  const { primary, secondary, strongPrimary, textOnPrimary, textMuted, textOnStrongPrimary } = useTheme();
  const { products } = useProductContext();
  const { productsArray } = useProductsArray(products);
  const { deleteSelectedProduct, addSelectedProduct, selectedProducts } =
    useSelectedProductContext();

  // categories state
  const [categories, setCategories] = useState<Record<string, Category>>({});

  // category filter state - multi-select using Set
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [isCategoryFilterModalVisible, setIsCategoryFilterModalVisible] = useState(false);

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

        return "rgba(255,255,255,0.85)";
      };

      return (
        <TouchableOpacity
          style={{
            flexDirection: "row",
            marginVertical: hp(0.5),
            borderRadius: wp(2),
            backgroundColor: productCardViewBackgroundColor(item),
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.6)",
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
                        color: "rgba(0,0,0,0.7)",
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
                fontSize: wp(4),
              }}
            >
              Stock: {item.stock}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [
      addSelectedProduct,
      deleteSelectedProduct,
      selectedProducts,
      getProductCategories,
      getCategoryBackgroundColor,
    ]
  );

  // searchbar
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

  return (
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
            onChangeText={(text) => {setSearchQuery(text)}}
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
  );
};

export default EditPosScreen;
