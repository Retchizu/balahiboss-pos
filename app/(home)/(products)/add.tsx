import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@/contexts/ThemeContext";
import Input from "@/components/inputs/Input";
import * as ImagePicker from "expo-image-picker";
import CommonButton from "@/components/buttons/CommonButton";
import { router } from "expo-router";
import { api } from "@/config/axios-api";
import { isAxiosError } from "axios";
import Toast from "react-native-toast-message";
import ModalTemplate from "@/components/modals/ModalTemplate";
import { Entypo } from "@expo/vector-icons";
import Category from "@/types/Category";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { firestoreDb } from "@/config/firebaseConfig";
import { Checkbox } from "expo-checkbox";
import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider,
} from "reanimated-color-picker";
import SearchBar from "@/components/searchbars/SearchBar";

const AddProductScreen = () => {
  const { primary, strongPrimary, textOnPrimary } = useTheme();
  // image state
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  // product form state
  const [productForm, setProductForm] = useState({
    productName: "",
    stockPrice: "",
    sellPrice: "",
    base64Image: "",
  });

  // category state
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set()
  );
  const [isCategorySelectModalVisible, setIsCategorySelectModalVisible] =
    useState(false);
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] =
    useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    categoryName: "",
    displayOrder: "",
    color: "#FF6B6B",
  });

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

  const handleInputChange = (field: string, value: string) => {
    setProductForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // image picker function
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const base64 = asset.base64 || "";

      // Infer MIME type from extension
      const extension = uri.split(".").pop()?.toLowerCase();
      let contentType = "image/jpeg"; // default

      if (extension === "png") contentType = "image/png";
      else if (extension === "jpg" || extension === "jpeg")
        contentType = "image/jpeg";
      else if (extension === "webp") contentType = "image/webp";

      const dataUrl = `data:${contentType};base64,${base64}`;

      setImageUri(uri);
      setProductForm((prev) => ({
        ...prev,
        base64Image: dataUrl,
      }));
    }
  };
  // Helper function to get selected categories
  const getSelectedCategories = useCallback((): Category[] => {
    return Array.from(selectedCategoryIds)
      .map((categoryId) => categories[categoryId])
      .filter((category): category is Category => category !== undefined);
  }, [selectedCategoryIds, categories]);

  // Helper function to get category background color with opacity
  const getCategoryBackgroundColor = useCallback((color?: string): string => {
    if (!color) return "rgba(175, 221, 255, 0.3)";
    if (color.startsWith("#") && color.length === 7) {
      return `${color}33`;
    }
    return "rgba(175, 221, 255, 0.3)";
  }, []);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    const allCategories = Object.values(categories);
    if (!categorySearchQuery.trim()) return allCategories;
    return allCategories.filter((category) =>
      category.categoryName
        .toLowerCase()
        .includes(categorySearchQuery.toLowerCase())
    );
  }, [categories, categorySearchQuery]);

  // Toggle category selection
  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategoryIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Create new category
  const createCategory = async () => {
    if (!categoryForm.categoryName.trim()) {
      Toast.show({
        type: "error",
        text1: "Category name is required",
      });
      return;
    }

    try {
      setIsAddingCategory(true);
      const requestBody: {
        categoryName: string;
        displayOrder?: number;
        color?: string;
      } = {
        categoryName: categoryForm.categoryName.trim(),
      };

      if (categoryForm.displayOrder.trim() !== "") {
        const displayOrder = parseFloat(categoryForm.displayOrder);
        if (!isNaN(displayOrder)) {
          requestBody.displayOrder = displayOrder;
        }
      }

      if (categoryForm.color && categoryForm.color.trim() !== "") {
        requestBody.color = categoryForm.color.trim();
      }

      const response = await api.post("/categories/add", requestBody);

      // Automatically select the newly created category
      if (response.data.category?.id) {
        setSelectedCategoryIds(
          (prev) => new Set([...prev, response.data.category.id])
        );
      }

      // Reset form
      setCategoryForm({
        categoryName: "",
        displayOrder: "",
        color: "#FF6B6B",
      });
      setIsAddCategoryModalVisible(false);
      Toast.show({ type: "success", text1: `${response?.data.message}` });
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({
          type: "error",
          text1: `${
            error.response?.data.message ||
            error.response?.data.error ||
            "Failed to create category"
          }`,
        });
      }
      console.error("Add Category failed:", error);
    } finally {
      setIsAddingCategory(false);
    }
  };

  // Handle category form input change
  const handleCategoryFormChange = (field: string, value: string) => {
    setCategoryForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onSelectColor = ({ hex }: { hex: string }) => {
    setCategoryForm((prev) => ({
      ...prev,
      color: hex,
    }));
  };

  // Remove category from product
  const removeCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(categoryId);
      return newSet;
    });
  };

  // upload product with image function
  const uploadProduct = async () => {
    setUploading(true);
    try {
      const {
        productName,
        stockPrice,
        sellPrice,
        base64Image,
      } = productForm;
      const response = await api.post("/products/add", {
        productName,
        stockPrice: parseFloat(stockPrice),
        sellPrice: parseFloat(sellPrice),
        stock: 0, // initial stock is 0
        base64Image,
        categoryIds: Array.from(selectedCategoryIds),
      });

      router.back();
      Toast.show({ type: "success", text1: `${response?.data.message}` });
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({ type: "error", text1: `${error.response?.data.error}` });
      }
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(5),
      }}
    >
      <Text style={styles.label}>Product name</Text>
      <Input
        value={productForm.productName}
        onChangeText={(value) => handleInputChange("productName", value)}
        placeholder="Enter Product Name"
      />
      <View style={{ flexDirection: "row", gap: wp(5), marginVertical: hp(1) }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Stock Price</Text>
          <Input
            value={productForm.stockPrice}
            onChangeText={(value) => handleInputChange("stockPrice", value)}
            placeholder="Enter Stock Price"
            inputType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Sell Price</Text>
          <Input
            value={productForm.sellPrice}
            onChangeText={(value) => handleInputChange("sellPrice", value)}
            placeholder="Enter Sell Price"
            inputType="numeric"
          />
        </View>
      </View>

      {/* Categories Section */}
      <Text style={[styles.label, { marginTop: hp(1), marginBottom: hp(0.5) }]}>
        Categories
      </Text>
      {getSelectedCategories().length > 0 && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: wp(2),
            marginBottom: hp(1),
          }}
        >
          {getSelectedCategories().map((category) => (
            <TouchableOpacity
              key={category.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: getCategoryBackgroundColor(category.color),
                paddingHorizontal: wp(3),
                paddingVertical: hp(0.5),
                borderRadius: wp(2),
                borderWidth: wp(0.2),
                borderColor: category.color || strongPrimary,
              }}
              onPress={() => removeCategory(category.id)}
            >
              {category.color && (
                <View
                  style={{
                    width: wp(2.5),
                    height: wp(2.5),
                    borderRadius: wp(1.25),
                    backgroundColor: category.color,
                    marginRight: wp(1.5),
                  }}
                />
              )}
              <Text
                style={{
                  fontFamily: "Gantari-Medium",
                  fontSize: wp(3.5),
                  color: "rgba(0,0,0,0.8)",
                  marginRight: wp(1),
                }}
              >
                {category.categoryName}
              </Text>
              <Entypo name="cross" size={wp(3.5)} color="rgba(0,0,0,0.6)" />
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          gap: wp(2),
          marginBottom: hp(1),
        }}
      >
        <CommonButton
          row
          onPress={() => {
            setIsCategorySelectModalVisible(true);
          }}
          title="Select Categories"
          titleColor={"white"}
        />

        <CommonButton
          row
          onPress={() => {
            setIsAddCategoryModalVisible(true);
          }}
          title="Add Category"
          titleColor={"white"}
          backgroundColor={strongPrimary}
        />
      </View>

      <Text style={[styles.label, { marginVertical: hp(1) }]}>
        Product Image
      </Text>
      <View
        style={{
          flexDirection: "row",
          gap: wp(5),
          marginVertical: hp(0.5),
          alignItems: "center",
        }}
      >
        <View
          style={{
            borderWidth: wp(0.3),
            borderColor: strongPrimary,
            borderRadius: wp(2),
            width: wp(23),
            height: hp(10),
          }}
        >
          <Image
            source={
              imageUri
                ? { uri: imageUri }
                : require("../../../assets/balahiboss.png")
            }
            style={{ width: "100%", height: "100%", borderRadius: wp(2) }}
            resizeMode="cover"
          />
        </View>
        <CommonButton
          onPress={pickImage}
          title="Choose File Image"
          row
          titleColor={"white"}
        />
      </View>
      <CommonButton
        onPress={async () => {
          await uploadProduct();
        }}
        title="Add Product"
        titleColor={"white"}
        loading={uploading}
        marginTop={hp(3)}
      />
      <CommonButton
        onPress={() => {
          router.back();
        }}
        title="Cancel"
        backgroundColor={primary}
        marginTop={hp(3)}
      />

      {/* Category Selection Modal */}
      <ModalTemplate
        visible={isCategorySelectModalVisible}
        onClose={() => {
          setIsCategorySelectModalVisible(false);
          setCategorySearchQuery("");
        }}
        height={hp(70)}
        width={wp(90)}
      >
        <View style={{ flex: 1, paddingHorizontal: wp(2) }}>
          <Text
            style={{
              fontFamily: "Gantari-Bold",
              fontSize: wp(5),
              marginBottom: hp(2),
              textAlign: "center",
            }}
          >
            Select Categories
          </Text>
          <SearchBar
            value={categorySearchQuery}
            onChangeText={setCategorySearchQuery}
            placeholder="Search Categories..."
          />
          <FlatList
            data={filteredCategories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedCategoryIds.has(item.id);
              return (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isSelected
                      ? getCategoryBackgroundColor(item.color)
                      : "rgba(255,255,255,0.85)",
                    borderWidth: 1,
                    borderColor: isSelected
                      ? item.color || strongPrimary
                      : "rgba(0,0,0,0.2)",
                    borderRadius: wp(2),
                    padding: wp(3),
                    marginVertical: hp(0.5),
                  }}
                  activeOpacity={0.7}
                  onPress={() => toggleCategorySelection(item.id)}
                >
                  <Checkbox
                    value={isSelected}
                    onValueChange={() => toggleCategorySelection(item.id)}
                    color={isSelected ? strongPrimary : undefined}
                  />
                  {item.color && (
                    <View
                      style={{
                        width: wp(4),
                        height: wp(4),
                        borderRadius: wp(2),
                        backgroundColor: item.color,
                        marginLeft: wp(2),
                        marginRight: wp(2),
                      }}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: wp(4),
                      fontFamily: "Gantari-Medium",
                      color: "black",
                      flex: 1,
                    }}
                  >
                    {item.categoryName}
                  </Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: hp(10),
                }}
              >
                <Text
                  style={{
                    fontSize: wp(4),
                    fontFamily: "Gantari-Regular",
                    color: "rgba(0,0,0,0.6)",
                  }}
                >
                  No categories found
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: hp(2) }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: wp(3),
              marginTop: hp(2),
            }}
          >
            <CommonButton
              title="Cancel"
              onPress={() => {
                setIsCategorySelectModalVisible(false);
                setCategorySearchQuery("");
              }}
              backgroundColor="#F3F4F6"
              titleColor={textOnPrimary}
              marginTop={0}
            />
            <CommonButton
              title="Done"
              onPress={() => {
                setIsCategorySelectModalVisible(false);
                setCategorySearchQuery("");
              }}
              backgroundColor={strongPrimary}
              titleColor="#ffffff"
              marginTop={0}
            />
          </View>
        </View>
      </ModalTemplate>

      {/* Add Category Modal */}
      <ModalTemplate
        visible={isAddCategoryModalVisible}
        onClose={() => {
          setIsAddCategoryModalVisible(false);
          setCategoryForm({
            categoryName: "",
            displayOrder: "",
            color: "#FF6B6B",
          });
        }}
        height={hp(55)}
        width={wp(90)}
      >
        <View style={{ paddingHorizontal: wp(2) }}>
          <Text
            style={{
              fontFamily: "Gantari-Bold",
              fontSize: wp(5),
              marginBottom: hp(2),
              textAlign: "center",
            }}
          >
            Add New Category
          </Text>

          <Text style={styles.label}>Category Name</Text>
          <Input
            value={categoryForm.categoryName}
            onChangeText={(text) =>
              handleCategoryFormChange("categoryName", text)
            }
            placeholder="Enter category name"
          />

          <Text style={[styles.label, { marginTop: hp(1) }]}>
            Display Order (Optional)
          </Text>
          <Input
            value={categoryForm.displayOrder}
            onChangeText={(text) =>
              handleCategoryFormChange("displayOrder", text)
            }
            placeholder="Enter display order"
            inputType="numeric"
          />

          <Text style={[styles.label, { marginTop: hp(1) }]}>
            Color (Optional)
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderColor: strongPrimary,
              borderWidth: wp(0.3),
              borderRadius: wp(2),
              padding: wp(1),
              backgroundColor: "white",
            }}
            onPress={() => setShowColorPicker(true)}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: wp(8),
                height: wp(8),
                borderRadius: wp(1),
                borderWidth: wp(0.2),
                borderColor: "rgba(0,0,0,0.2)",
                backgroundColor: categoryForm.color,
              }}
            />
            <Text
              style={{
                fontFamily: "Gantari-Regular",
                fontSize: wp(4.5),
                color: "black",
                marginLeft: wp(2),
              }}
            >
              {categoryForm.color}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: wp(3),
              marginTop: hp(3),
            }}
          >
            <CommonButton
              title="Cancel"
              onPress={() => {
                setIsAddCategoryModalVisible(false);
                setCategoryForm({
                  categoryName: "",
                  displayOrder: "",
                  color: "#FF6B6B",
                });
              }}
              backgroundColor="#F3F4F6"
              titleColor={textOnPrimary}
              marginTop={0}
            />
            <CommonButton
              title="Add Category"
              onPress={createCategory}
              titleColor="white"
              loading={isAddingCategory}
              disabled={isAddingCategory}
              marginTop={0}
            />
          </View>
        </View>
      </ModalTemplate>

      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: wp(5),
          }}
        >
          <View
            style={{
              backgroundColor: primary,
              borderRadius: wp(4),
              padding: wp(5),
              width: "90%",
              maxHeight: "80%",
            }}
          >
            <Text
              style={{
                fontSize: wp(5),
                fontFamily: "Gantari-SemiBold",
                color: "black",
                marginBottom: hp(2),
                textAlign: "center",
              }}
            >
              Select Color
            </Text>
            <ColorPicker
              style={{ width: "100%" }}
              value={categoryForm.color}
              onCompleteJS={onSelectColor}
            >
              <Preview />
              <Panel1 />
              <HueSlider />
              <OpacitySlider />
              <Swatches />
            </ColorPicker>
            <CommonButton
              title="Done"
              onPress={() => setShowColorPicker(false)}
              titleColor="white"
              marginTop={hp(2)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddProductScreen;

const styles = {
  label: {
    fontSize: wp(4.5),
    fontFamily: "Gantari-Medium",
    marginBottom: hp(0.5),
  },
};
