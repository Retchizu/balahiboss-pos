import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { primary, strongPrimary } from "@/theme/backgroundTheme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import CommonButton from "@/components/buttons/CommonButton";
import Input from "@/components/inputs/Input";
import { router, useLocalSearchParams } from "expo-router";
import { useProductContext } from "@/contexts/ProductContext";
import * as ImagePicker from "expo-image-picker";
import { api } from "@/config/axios-api";
import * as FileSystem from "expo-file-system";
import { isAxiosError } from "axios";
import FloatingButton from "@/components/buttons/FloatingButton";
import ModalTemplate from "@/components/modals/ModalTemplate";
import Toast from "react-native-toast-message";
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

const UpdateScreen = () => {
  // product params
  const { id }: { id: string } = useLocalSearchParams();
  const { products } = useProductContext();
  const product = products[id];

  async function imageUrlToBase64(url: string): Promise<string> {
    const base64 = await FileSystem.readAsStringAsync(url, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`; // or png/webp depending on your file
  }

  // product form state
  const [productForm, setProductForm] = useState({
    productName: product.productName,
    stockPrice: product.stockPrice.toString(),
    sellPrice: product.sellPrice.toString(),

    base64Image: "",
    stock: product.stock.toString(),
  });

  const handleInputChange = (field: string, value: string) => {
    setProductForm({ ...productForm, [field]: value });
  };

  // set base64Image from product imageUrl if available
  useEffect(() => {
    if (product.imageUrl) {
      imageUrlToBase64(product.imageUrl).then((base64) => {
        setProductForm((prev) => ({
          ...prev,
          base64Image: base64,
        }));
      });
    }
  }, [product.imageUrl]);

  const [imageUri, setImageUri] = useState<string | null>(
    product.imageUrl || null
  );
  const [updating, setUpdating] = useState(false);

  // category state
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(product.categoryIds || [])
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
  const { setProducts } = useProductContext();

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

  // Update selectedCategoryIds when product.categoryIds changes
  useEffect(() => {
    setSelectedCategoryIds(new Set(product.categoryIds || []));
  }, [product.categoryIds]);

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

  // update product function
  const updateProduct = async () => {
    setUpdating(true);
    try {
      const { productName, stockPrice, sellPrice, base64Image, stock } =
        productForm;

      const updatedProduct = {
        id,
        productName,
        stockPrice: parseFloat(stockPrice),
        sellPrice: parseFloat(sellPrice),
        stock: parseFloat(stock),
        base64Image: base64Image,
        categoryIds: Array.from(selectedCategoryIds),
      };

      const response = await api.put(`/products/update/${id}`, updatedProduct);

      // Update local products state
      setProducts((prevProducts) => ({
        ...prevProducts,
        [id]: {
          ...prevProducts[id],
          categoryIds: Array.from(selectedCategoryIds),
        },
      }));

      Toast.show({ type: "success", text1: `${response?.data.message}` });
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({ type: "error", text1: `${error.response?.data.error}` });
      }
      console.error("Error updating product:", error);
    } finally {
      setUpdating(false);
    }
  };

  // delete modal
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const deleteProduct = async () => {
    try {
      setIsDeleteModalVisible(false);
      const response = await api.delete(`/products/delete/${id}`);
      router.back();
      Toast.show({ type: "success", text1: `${response?.data.message}` });
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({ type: "error", text1: `${error.response?.data.error}` });
      }
      console.error("Error deleting product:", error);
    }
  };

  // add stock
  const [addStockModalVisible, setAddStockModalVisible] = useState(false);
  const [additionalStock, setAdditionalStock] = useState("0");
  const [isAddStockLoading, setIsAddStockLoading] = useState(false);

  const addStock = async () => {
    try {
      setIsAddStockLoading(true);
      const response = await api.patch(`/products/add-stock/${id}`, {
        additionalStock: parseFloat(additionalStock),
      });
      Toast.show({
        type: "success",
        text1: `${response?.data.message}`,
      });
      setProductForm((prev) => ({
        ...prev,
        stock: (product.stock + parseFloat(additionalStock)).toString(),
      }));
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({
          type: "error",
          text1: `${error.response?.data.error}`,
        });
      }
      console.error("Error adding stock:", error);
    } finally {
      setIsAddStockLoading(false);
      setAdditionalStock("0");
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
      <View style={{ flexDirection: "row", gap: wp(5), marginVertical: hp(1) }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Stock</Text>
          <Input
            value={productForm.stock}
            onChangeText={(value) => handleInputChange("stock", value)}
            placeholder="Enter Stock"
            inputType="numeric"
          />
        </View>
        <View>
          <Text style={{ fontSize: hp(2.5) }}></Text>
          <CommonButton
            row
            onPress={() => {
              setAddStockModalVisible(true);
            }}
            title="Add Stock"
            titleColor={"white"}
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
          await updateProduct();
        }}
        title="Update Product"
        titleColor={"white"}
        loading={updating}
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
      {
        // delete product button
      }
      <FloatingButton
        backgroundColor={strongPrimary}
        onPress={async () => {
          setIsDeleteModalVisible(true);
        }}
        icon={{ color: "white", family: "Entypo", name: "trash", size: wp(7) }}
      />
      <ModalTemplate
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        height={hp(34)}
        width={wp(88)}
      >
        <View style={{ alignItems: "center", paddingHorizontal: wp(3) }}>
          <Entypo
            name="trash"
            size={wp(14)}
            color="#ef4444"
            style={{ marginBottom: hp(1) }}
          />
          <Text
            style={{
              fontFamily: "Gantari-Bold",
              fontSize: wp(5),
              textAlign: "center",
            }}
          >
            Delete {product.productName}?
          </Text>
          <Text
            style={{
              fontFamily: "Gantari-Regular",
              fontSize: wp(3.8),
              color: "#6B7280",
              textAlign: "center",
              marginTop: hp(1),
              lineHeight: hp(2.4),
            }}
          >
            This action cannot be undone. All records related to this product
            will be permanently removed.
          </Text>
        </View>

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
            onPress={() => setIsDeleteModalVisible(false)}
            backgroundColor="#F3F4F6"
            titleColor="#111827"
            marginTop={0}
          />
          <CommonButton
            title="Delete"
            onPress={async () => {
              await deleteProduct();
            }}
            backgroundColor="#ef4444"
            titleColor="#ffffff"
            marginTop={0}
          />
        </View>
      </ModalTemplate>
      {
        // add stock modal
      }
      <ModalTemplate
        visible={addStockModalVisible}
        onClose={() => setAddStockModalVisible(false)}
        height={hp(26)}
        width={wp(90)}
      >
        <Text
          style={{
            fontFamily: "Gantari-Bold",
            fontSize: wp(5),
            marginBottom: hp(2),
            textAlign: "center",
          }}
        >
          Add Stock for {product.productName}
        </Text>
        <Input
          value={additionalStock}
          onChangeText={(value) => setAdditionalStock(value)}
          placeholder="Enter additional stock"
          inputType="numeric"
        />

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
              setAddStockModalVisible(false);
              setAdditionalStock("0");
            }}
            backgroundColor="#F3F4F6"
            titleColor="#111827"
            marginTop={0}
          />
          <CommonButton
            title="Add Stock"
            onPress={async () => {
              await addStock();
              setAddStockModalVisible(false);
            }}
            loading={isAddStockLoading}
            backgroundColor={strongPrimary}
            titleColor="#ffffff"
            marginTop={0}
          />
        </View>
      </ModalTemplate>

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
              titleColor="#111827"
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
              titleColor="#111827"
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

export default UpdateScreen;

const styles = {
  label: {
    fontSize: wp(4.5),
    fontFamily: "Gantari-Medium",
    marginBottom: hp(0.5),
  },
};
