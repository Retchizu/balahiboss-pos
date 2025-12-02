import { View, Text, Image } from "react-native";
import React, { useEffect, useState } from "react";
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
      };

      // Call your update API here
      // await updateProductAPI(updatedProduct);
      const response = await api.put(`/product/update/${id}`, updatedProduct);
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
      const response = await api.delete(`/product/delete/${id}`);
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
      const response = await api.patch(`/product/add-stock/${id}`, {
        additionalStock: parseFloat(additionalStock),
      });
      Toast.show({
        type: "success",
        text1: `${response?.data.message}`,
      });
      setProductForm((prev) => ({
        ...prev,
        stock: (
          product.stock + parseFloat(additionalStock)
        ).toString(),
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
