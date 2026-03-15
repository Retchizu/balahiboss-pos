import { View, Text, FlatList, Image, TouchableOpacity, ScrollView } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@/contexts/ThemeContext";
import SearchBar from "@/components/searchbars/SearchBar";
import useProductsArray from "@/hooks/useProductsArray";
import { useProductContext } from "@/contexts/ProductContext";
import FloatingButton from "@/components/buttons/FloatingButton";
import { router } from "expo-router";
import searchProductsByName from "@/methods/search/searchProductsByName";
import Category from "@/types/Category";
import Product from "@/types/Product";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { firestoreDb } from "@/config/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import ModalTemplate from "@/components/modals/ModalTemplate";
import CommonButton from "@/components/buttons/CommonButton";
import { getContrastTextColor } from "@/theme/contrast";

const ProductListScreen = () => {
  const { primary, secondary, strongPrimary, textOnPrimary, textMuted, textOnStrongPrimary } =
    useTheme();
  const [searchBarValue, setSearchBarValue] = React.useState("");
  const { products } = useProductContext();
  const { productsArray } = useProductsArray(products);

  // categories state
  const [categories, setCategories] = useState<Record<string, Category>>({});

  // category filter state - multi-select using Set
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [isCategoryFilterModalVisible, setIsCategoryFilterModalVisible] = useState(false);

  const filteredProducts = useMemo(() => {
    let filtered = searchProductsByName(productsArray, searchBarValue);
    
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
  }, [productsArray, searchBarValue, selectedCategoryIds]);

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
            value={searchBarValue}
            onChangeText={setSearchBarValue}
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
            color={"black"}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              marginVertical: hp(0.5),
              borderRadius: wp(2),
              backgroundColor: item.stock <= 0 ? "rgba(80,109,132,0.3)" : "rgba(255,255,255,0.85)",
              borderWidth: 1,
              borderColor: textMuted,
            }}
            activeOpacity={0.7}
            onPress={() => {
              router.navigate(`../${item.id}`);
            }}
          >
            <View
              style={{
                borderColor: strongPrimary,
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
                  color: item.stock <= 0 ? "rgba(80,109,132,0.8)" : "black",
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
                          color: getContrastTextColor(category.color || primary),
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
        )}
        style={{ marginTop: hp(1) }}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
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
            titleColor={textOnPrimary}
            marginTop={0}
          />
          <CommonButton
            title="Apply"
            onPress={() => setIsCategoryFilterModalVisible(false)}
            backgroundColor={strongPrimary}
            marginTop={0}
          />
        </View>
      </ModalTemplate>

      <FloatingButton
        onPress={() => {
          router.navigate("../add");
        }}
        icon={{ name: "plus", family: "Entypo", color: textOnStrongPrimary, size: wp(6) }}
        backgroundColor={strongPrimary}
      />
    </View>
  );
};

export default ProductListScreen;
