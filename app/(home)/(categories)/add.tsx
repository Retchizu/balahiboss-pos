import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { primary, strongPrimary } from "@/theme/backgroundTheme";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Input from "@/components/inputs/Input";
import CommonButton from "@/components/buttons/CommonButton";
import { router } from "expo-router";
import { isAxiosError } from "axios";
import { api } from "@/config/axios-api";
import Toast from "react-native-toast-message";
import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider,
} from "reanimated-color-picker";

const AddCategoryScreen = () => {
  const [categoryForm, setCategoryForm] = useState({
    categoryName: "",
    displayOrder: "",
    color: "#FF6B6B", // Default color
  });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

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

  // add category
  const addCategory = async () => {
    // Validate category name
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

      // Only include displayOrder if it's provided and valid
      if (categoryForm.displayOrder.trim() !== "") {
        const displayOrder = parseFloat(categoryForm.displayOrder);
        if (!isNaN(displayOrder)) {
          requestBody.displayOrder = displayOrder;
        }
      }

      // Include color if provided
      if (categoryForm.color && categoryForm.color.trim() !== "") {
        requestBody.color = categoryForm.color.trim();
      }

      const response = await api.post("/categories/add", requestBody);
      router.back();
      Toast.show({ type: "success", text1: `${response?.data.message}` });
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.show({
          type: "error",
          text1: `${error.response?.data.message || error.response?.data.error || "Failed to create category"}`,
        });
      }
      console.error("Add Category failed:", error);
    } finally {
      setIsAddingCategory(false);
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
      <Text
        style={{
          fontSize: wp(5),
          fontFamily: "Gantari-SemiBold",
          color: "black",
          marginBottom: hp(2),
        }}
      >
        Add Category
      </Text>

      <Text style={styles.label}>Category Name</Text>
      <Input
        value={categoryForm.categoryName}
        onChangeText={(text) => handleInputChange("categoryName", text)}
        placeholder="Enter category name"
      />

      <Text style={[styles.label, { marginTop: hp(1) }]}>
        Display Order (Optional)
      </Text>
      <Input
        value={categoryForm.displayOrder}
        onChangeText={(text) => handleInputChange("displayOrder", text)}
        placeholder="Enter display order (default: 0)"
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
            color: "black",
            marginLeft: wp(2),
          }}
        >
          {categoryForm.color}
        </Text>
      </TouchableOpacity>

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

      <CommonButton
        onPress={async () => {
          await addCategory();
        }}
        title="Add Category"
        titleColor={"white"}
        loading={isAddingCategory}
        marginTop={hp(3)}
      />
      <CommonButton
        onPress={() => {
          router.back();
        }}
        title="Cancel"
        backgroundColor={primary}
        marginTop={hp(1)}
      />
    </View>
  );
};

export default AddCategoryScreen;

const styles = StyleSheet.create({
  label: {
    fontSize: wp(4.5),
    fontFamily: "Gantari-Medium",
    marginBottom: hp(0.5),
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
});

