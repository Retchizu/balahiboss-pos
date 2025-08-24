import { View, Text, StyleSheet, Image } from "react-native";
import React, { useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { primary, strongPrimary } from "@/theme/backgroundTheme";
import Input from "@/components/inputs/Input";
import * as ImagePicker from "expo-image-picker";
import CommonButton from "@/components/buttons/CommonButton";
import { router } from "expo-router";
import { api } from "@/config/axios-api";
import { isAxiosError } from "axios";

const AddProductScreen = () => {
  // image state
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  // product form state
  const [productForm, setProductForm] = useState({
    productName: "",
    stockPrice: "",
    sellPrice: "",
    lowStockThreshold: "",
    base64Image: "",
  });

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
  console.log(productForm.base64Image.substring(0, 500));
  // upload product with image function
  const uploadProduct = async () => {
    setUploading(true);
    try {
      const {
        productName,
        stockPrice,
        sellPrice,
        lowStockThreshold,
        base64Image,
      } = productForm;
      const response = await api.post("/product/add", {
        productName,
        stockPrice: parseFloat(stockPrice),
        sellPrice: parseFloat(sellPrice),
        lowStockThreshold: parseFloat(lowStockThreshold || "0"),
        stock: 0, // initial stock is 0
        base64Image,
      });

      const data = response.data.message;
      router.back();
      console.log(data);
    } catch (err) {
      if (isAxiosError(err)) {
        console.error("Upload failed:", err.response?.data.message);
      }
      console.error("Upload failed:", err);
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
      <Text style={styles.label}>Low Stock Threshold</Text>
      <Input
        value={productForm.lowStockThreshold}
        onChangeText={(value) => handleInputChange("lowStockThreshold", value)}
        placeholder="Enter Low Stock Threshold"
        inputType="numeric"
      />
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
    </View>
  );
};

export default AddProductScreen;

const styles = StyleSheet.create({
  label: {
    fontSize: wp(4.5),
    fontFamily: "Gantari-Medium",
    marginBottom: hp(0.5),
  },
});
