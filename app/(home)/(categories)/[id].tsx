import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    Modal,
} from "react-native";
import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useLocalSearchParams, router } from "expo-router";
import { api } from "@/config/axios-api";
import { isAxiosError } from "axios";
import Toast from "react-native-toast-message";
import Category from "@/types/Category";
import { Checkbox } from "expo-checkbox";
import CommonButton from "@/components/buttons/CommonButton";
import RenderLabelValuePair from "@/components/view/RenderLabelValuePair";
import SearchBar from "@/components/searchbars/SearchBar";
import searchProductsByName from "@/methods/search/searchProductsByName";
import { useProductContext } from "@/contexts/ProductContext";
import useProductsArray from "@/hooks/useProductsArray";
import Input from "@/components/inputs/Input";
import ModalTemplate from "@/components/modals/ModalTemplate";
import ColorPicker, {
    Panel1,
    Swatches,
    Preview,
    OpacitySlider,
    HueSlider,
} from "reanimated-color-picker";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Product from "@/types/Product";
import {
    collection,
    onSnapshot,
    query,
    orderBy,
} from "firebase/firestore";
import { firestoreDb } from "@/config/firebaseConfig";

const CategoryDetailScreen = () => {
    const { primary, strongPrimary, textOnPrimary, textOnStrongPrimary, textMuted } = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();

    console.log(id)
    const [category, setCategory] = useState<Category | null>(null);
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
        new Set()
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [assigning, setAssigning] = useState(false);
    const { products, setProducts } = useProductContext();
    const { productsArray } = useProductsArray(products);
    const hasInitializedSelections = useRef<string | null>(null);

    // categories state
    const [categories, setCategories] = useState<Record<string, Category>>({});

    // Update and Delete states
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [categoryForm, setCategoryForm] = useState({
        categoryName: "",
        displayOrder: "",
        color: "",
    });

    // Fetch category details
    useEffect(() => {
        const fetchCategory = async () => {
            if (!id) return;
            try {
                const response = await api.get(`/categories/${id}`);
                setCategory(response.data.category);
            } catch (error) {
                if (isAxiosError(error)) {
                    Toast.show({
                        type: "error",
                        text1:
                            error.response?.data.message ||
                            "Failed to fetch category",
                    });
                }
                console.error("Error fetching category:", error);
            }
        };
        fetchCategory();
    }, [id]);

    // Initialize form when category is loaded or edit modal opens
    useEffect(() => {
        if (category && isEditModalVisible) {
            setCategoryForm({
                categoryName: category.categoryName || "",
                displayOrder: category.displayOrder?.toString() || "",
                color: category.color || "#FF6B6B",
            });
        }
    }, [category, isEditModalVisible]);

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

    // Pre-select products that already have this category ID
    useEffect(() => {
        if (!id || productsArray.length === 0) return;

        // Only initialize selections once per category ID
        if (hasInitializedSelections.current === id) return;

        // Reset selections if category ID changed
        if (hasInitializedSelections.current !== null && hasInitializedSelections.current !== id) {
            setSelectedProductIds(new Set());
        }

        const preSelectedIds = new Set<string>();
        productsArray.forEach((product) => {
            if (
                product.categoryIds &&
                Array.isArray(product.categoryIds) &&
                product.categoryIds.includes(id)
            ) {
                preSelectedIds.add(product.id);
            }
        });

        setSelectedProductIds(preSelectedIds);
        hasInitializedSelections.current = id;
    }, [id, productsArray]);

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

    // Filter and sort products: selected products first, then non-selected (both alphabetically)
    const filteredProducts = useMemo(() => {
        const filtered = searchProductsByName(
            productsArray.filter((p) => !p.deleted),
            searchQuery
        );

        // Separate selected and non-selected products
        const selected: typeof filtered = [];
        const nonSelected: typeof filtered = [];

        filtered.forEach((product) => {
            if (selectedProductIds.has(product.id)) {
                selected.push(product);
            } else {
                nonSelected.push(product);
            }
        });

        // Sort each group alphabetically
        selected.sort((a, b) => a.productName.localeCompare(b.productName));
        nonSelected.sort((a, b) => a.productName.localeCompare(b.productName));

        // Return selected products first, then non-selected
        return [...selected, ...nonSelected];
    }, [productsArray, searchQuery, selectedProductIds]);

    // Toggle product selection
    const toggleProductSelection = (productId: string) => {
        setSelectedProductIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    // Assign category to selected products
    const assignCategoryToProducts = async () => {
        if (!id || selectedProductIds.size === 0) {
            Toast.show({
                type: "error",
                text1: "Please select at least one product",
            });
            return;
        }

        try {
            setAssigning(true);
            const response = await api.post(`/categories/${id}/products`, {
                productIds: Array.from(selectedProductIds),
            });

            // Update local products state to reflect the category assignment
            setProducts((prevProducts) => {
                const updatedProducts = { ...prevProducts };
                selectedProductIds.forEach((productId) => {
                    const product = updatedProducts[productId];
                    if (product) {
                        const categoryIds = product.categoryIds || [];
                        // Add category ID if it doesn't already exist
                        if (!categoryIds.includes(id)) {
                            updatedProducts[productId] = {
                                ...product,
                                categoryIds: [...categoryIds, id],
                            };
                        }
                    }
                });
                return updatedProducts;
            });

            Toast.show({
                type: "success",
                text1:
                    response.data.message || "Category assigned successfully",
            });
        } catch (error) {
            if (isAxiosError(error)) {
                Toast.show({
                    type: "error",
                    text1:
                        error.response?.data.message ||
                        "Failed to assign category to products",
                });
            }
            console.error("Error assigning category to products:", error);
        } finally {
            setAssigning(false);
        }
    };

    // Update category
    const updateCategory = async () => {
        if (!id) return;

        if (!categoryForm.categoryName.trim()) {
            Toast.show({
                type: "error",
                text1: "Category name is required",
            });
            return;
        }

        try {
            setIsUpdating(true);
            const requestBody: {
                categoryName?: string;
                displayOrder?: number;
                color?: string;
            } = {};

            if (categoryForm.categoryName.trim() !== category?.categoryName) {
                requestBody.categoryName = categoryForm.categoryName.trim();
            }

            if (categoryForm.displayOrder.trim() !== "") {
                const displayOrder = parseFloat(categoryForm.displayOrder);
                if (!isNaN(displayOrder) && displayOrder !== category?.displayOrder) {
                    requestBody.displayOrder = displayOrder;
                }
            }

            if (categoryForm.color && categoryForm.color.trim() !== "") {
                const colorValue = categoryForm.color.trim();
                if (colorValue !== category?.color) {
                    requestBody.color = colorValue;
                }
            }

            // Only make API call if there are changes
            if (Object.keys(requestBody).length === 0) {
                Toast.show({
                    type: "info",
                    text1: "No changes to save",
                });
                setIsEditModalVisible(false);
                return;
            }

            const response = await api.put(`/categories/update/${id}`, requestBody);
            setCategory(response.data.category);
            setIsEditModalVisible(false);
            Toast.show({
                type: "success",
                text1: response.data.message || "Category updated successfully",
            });
        } catch (error) {
            if (isAxiosError(error)) {
                Toast.show({
                    type: "error",
                    text1:
                        error.response?.data.message ||
                        "Failed to update category",
                });
            }
            console.error("Error updating category:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Delete category
    const deleteCategory = async () => {
        if (!id) return;

        try {
            setIsDeleting(true);
            await api.delete(`/categories/delete/${id}`);
            Toast.show({
                type: "success",
                text1: "Category deleted successfully",
            });
            router.back();
        } catch (error) {
            if (isAxiosError(error)) {
                Toast.show({
                    type: "error",
                    text1:
                        error.response?.data.message ||
                        "Failed to delete category",
                });
                
            }
            console.error("Error deleting category:", (error as Error).message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
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

    const styles = useMemo(
        () =>
            StyleSheet.create({
                productItem: {
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.85)",
                    borderWidth: 1,
                    borderColor: "rgba(0,0,0,0.2)",
                    borderRadius: wp(2),
                    padding: wp(3),
                    marginVertical: hp(0.5),
                },
                selectedProductItem: {
                    backgroundColor: "#AFDDFF",
                    borderColor: strongPrimary,
                    borderWidth: wp(0.5),
                },
                label: {
                    fontSize: wp(4.5),
                    fontFamily: "Gantari-Medium",
                    marginBottom: hp(0.5),
                    color: textOnPrimary,
                },
                colorPickerButton: {
                    flexDirection: "row",
                    alignItems: "center",
                    borderColor: strongPrimary,
                    borderWidth: wp(0.3),
                    borderRadius: wp(2),
                    padding: wp(1),
                    backgroundColor: "white",
                },
                colorPreview: {
                    width: wp(8),
                    height: wp(8),
                    borderRadius: wp(1),
                    borderWidth: wp(0.2),
                    borderColor: "rgba(0,0,0,0.2)",
                },
                modalOverlay: {
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: wp(5),
                },
                colorPickerContainer: {
                    backgroundColor: primary,
                    borderRadius: wp(4),
                    padding: wp(5),
                    width: "90%",
                    maxHeight: "80%",
                },
            }),
        [primary, strongPrimary, textOnPrimary]
    );

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: primary,
                paddingVertical: hp(2),
                paddingHorizontal: wp(5),
            }}
        >
            <Text
                style={{
                    fontSize: wp(5),
                    fontFamily: "Gantari-SemiBold",
                    color: textOnPrimary,
                    marginBottom: hp(2),
                }}
            >
                Category Details
            </Text>

            {/* Category Information */}
            {category && (
                <View
                    style={{
                        backgroundColor: "rgba(255,255,255,0.85)",
                        borderRadius: wp(2),
                        padding: wp(4),
                        marginBottom: hp(2),
                        borderWidth: 1,
                        borderColor: "rgba(0,0,0,0.1)",
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: hp(1),
                        }}
                    >
                        <View
                            style={{
                                width: wp(6),
                                height: wp(6),
                                borderRadius: wp(1),
                                backgroundColor:
                                    category.color || strongPrimary,
                                marginRight: wp(2),
                            }}
                        />
                        <Text
                            style={{
                                fontSize: wp(5),
                                fontFamily: "Gantari-SemiBold",
                                color: textOnPrimary,
                                flex: 1,
                            }}
                        >
                            {category.categoryName}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setIsEditModalVisible(true)}
                            activeOpacity={0.7}
                            style={{ marginLeft: wp(2) }}
                        >
                            <MaterialIcons
                                name="edit"
                                size={wp(6)}
                                color={strongPrimary}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setIsDeleteModalVisible(true)}
                            activeOpacity={0.7}
                            style={{ marginLeft: wp(2) }}
                        >
                            <MaterialIcons
                                name="delete"
                                size={wp(6)}
                                color="#ef4444"
                            />
                        </TouchableOpacity>
                    </View>
                    <RenderLabelValuePair
                        label="Display Order"
                        value={category.displayOrder?.toString() || "0"}
                    />
                    {category.color && (
                        <RenderLabelValuePair
                            label="Color"
                            value={category.color}
                        />
                    )}
                </View>
            )}

            {/* Products Section */}
            <Text
                style={{
                    fontSize: wp(4.5),
                    fontFamily: "Gantari-SemiBold",
                    color: textOnPrimary,
                    marginBottom: hp(1),
                }}
            >
                Select Products to Assign
            </Text>

            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search Products..."
            />

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isSelected = selectedProductIds.has(item.id);
                    return (
                        <TouchableOpacity
                            style={[
                                styles.productItem,
                                isSelected && styles.selectedProductItem,
                            ]}
                            activeOpacity={0.7}
                            onPress={() => toggleProductSelection(item.id)}
                        >
                            <Checkbox
                                value={isSelected}
                                onValueChange={() =>
                                    toggleProductSelection(item.id)
                                }
                                color={isSelected ? strongPrimary : undefined}
                            />
                            <View
                                style={{
                                    borderColor: "#FF9149",
                                    borderWidth: wp(0.2),
                                    borderRadius: wp(3),
                                    marginLeft: wp(2),
                                }}
                            >
                                <Image
                                    source={
                                        item.imageUrl
                                            ? { uri: item.imageUrl }
                                            : require("../../../assets/balahiboss.png")
                                    }
                                    style={{
                                        height: hp(6),
                                        width: wp(12),
                                        borderRadius: wp(3),
                                    }}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: wp(2) }}>
                                <Text
                                    style={{
                                        fontSize: wp(4),
                                        fontFamily: "Gantari-SemiBold",
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
                                        fontSize: wp(3.5),
                                        fontFamily: "Gantari-Regular",
                                        color: textOnStrongPrimary,
                                    }}
                                >
                                    Stock: {item.stock} | Price: ₱
                                    {item.sellPrice.toFixed(2)}
                                </Text>
                            </View>
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
                                color: textMuted,
                            }}
                        >
                            No products found
                        </Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: hp(2) }}
            />

            {/* Confirm Button */}
            <CommonButton
                title={`Assign to ${selectedProductIds.size} Product${
                    selectedProductIds.size !== 1 ? "s" : ""
                }`}
                onPress={assignCategoryToProducts}
                titleColor={textOnStrongPrimary}
                backgroundColor={strongPrimary}
                loading={assigning}
                disabled={selectedProductIds.size === 0 || assigning}
                marginTop={hp(2)}
            />

            {/* Edit Category Modal */}
            <ModalTemplate
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                height={hp(50)}
                width={wp(90)}
            >
                <View style={{ paddingHorizontal: wp(2) }}>
                    <Text
                        style={{
                            fontSize: wp(5),
                            fontFamily: "Gantari-SemiBold",
                            color: textOnPrimary,
                            marginBottom: hp(2),
                            textAlign: "center",
                        }}
                    >
                        Edit Category
                    </Text>

                    <Text style={styles.label}>Category Name</Text>
                    <Input
                        value={categoryForm.categoryName}
                        onChangeText={(text) =>
                            handleInputChange("categoryName", text)
                        }
                        placeholder="Enter category name"
                    />

                    <Text style={[styles.label, { marginTop: hp(1) }]}>
                        Display Order (Optional)
                    </Text>
                    <Input
                        value={categoryForm.displayOrder}
                        onChangeText={(text) =>
                            handleInputChange("displayOrder", text)
                        }
                        placeholder="Enter display order"
                        inputType="numeric"
                    />

                    <Text style={[styles.label, { marginTop: hp(1) }]}>
                        Color (Optional)
                    </Text>
                    <TouchableOpacity
                        style={styles.colorPickerButton}
                        onPress={() => setShowColorPicker(true)}
                        activeOpacity={0.7}
                    >
                        <View
                            style={[
                                styles.colorPreview,
                                { backgroundColor: categoryForm.color },
                            ]}
                        />
                        <Text
                            style={{
                                fontFamily: "Gantari-Regular",
                                fontSize: wp(4.5),
                                color: textOnPrimary,
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
                            onPress={() => setIsEditModalVisible(false)}
                            backgroundColor="#F3F4F6"
                            titleColor={textOnPrimary}
                            marginTop={0}
                        />
                        <CommonButton
                            title="Update"
                            onPress={updateCategory}
                            backgroundColor={strongPrimary}
                            titleColor={textOnStrongPrimary}
                            loading={isUpdating}
                            disabled={isUpdating}
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
                <View style={styles.modalOverlay}>
                    <View style={styles.colorPickerContainer}>
                        <Text
                            style={{
                                fontSize: wp(5),
                                fontFamily: "Gantari-SemiBold",
                                color: textOnPrimary,
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
                            backgroundColor={strongPrimary}
                            titleColor={textOnStrongPrimary}
                            marginTop={hp(2)}
                        />
                    </View>
                </View>
            </Modal>

            {/* Delete Category Modal */}
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
                            color: textOnPrimary,
                            textAlign: "center",
                        }}
                    >
                        Delete {category?.categoryName}?
                    </Text>
                    <Text
                        style={{
                            fontFamily: "Gantari-Regular",
                            fontSize: wp(3.8),
                            color: textMuted,
                            textAlign: "center",
                            marginTop: hp(1),
                            lineHeight: hp(2.4),
                        }}
                    >
                        This action cannot be undone. The category will be
                        permanently removed.
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
                        titleColor={textOnPrimary}
                        marginTop={0}
                    />
                    <CommonButton
                        title="Delete"
                        onPress={deleteCategory}
                        backgroundColor="#ef4444"
                        titleColor="#ffffff"
                        marginTop={0}
                        loading={isDeleting}
                        disabled={isDeleting}
                    />
                </View>
            </ModalTemplate>
        </View>
    );
};

export default CategoryDetailScreen;
