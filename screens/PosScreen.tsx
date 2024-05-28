import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Fontisto, Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";

import ListComponent from "../components/ListComponent";
import { useProductContext } from "../context/productContext";
import { useCustomerContext } from "../context/customerContext";
import { Customer, PosRootStackParamList, Product } from "../type";
import Toast from "react-native-simple-toast";
import { auth, db } from "../firebaseconfig";
import { Button } from "@rneui/base";
import {
  KeyboardAwareFlatList,
  KeyboardAwareScrollView,
} from "react-native-keyboard-aware-scroll-view";

type Prop = BottomTabScreenProps<PosRootStackParamList, "PosScreen">;

const PosScreen = ({ navigation }: Prop) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { setCustomerList } = useCustomerContext();
  const { products, setProductList } = useProductContext();
  const [selected, setSelected] = useState<String[]>([]);
  const [initialFetchProduct, setInitialFetchProduct] = useState(false);
  const [initialFetchCustomer, setInitialFetchCustomer] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    { product: Product; quantity: number }[]
  >([]);
  const user = auth.currentUser;
  const [quantityInput, setQuantityInput] = useState<{
    [productId: string]: string;
  }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [previewModalVisible, setPreviewModaVisible] = useState(false);
  const modalContentRef = useRef<View>(null);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [snapButtonVisible, setSnapButtonVisible] = useState(true);
  const [showDeliveryFeeModal, setShowDeliveryFeeModal] = useState(false);
  const [editDeliverFee, setEditDeliveryFee] = useState("");

  const deliveryFee = useRef(0);

  if (status === null) {
    requestPermission();
  }

  console.log(quantityInput);
  useFocusEffect(
    useCallback(() => {
      return () => {
        setSelectedProducts([]);
        setSelected([]); // Reset selectedProducts when navigating away
      };
    }, [])
  );
  useEffect(() => {
    readProductData();
    readCustomerData();
  }, []);
  console.log(selectedProducts);
  //read product data

  const readProductData = async () => {
    if (user) {
      try {
        const fetched: Product[] = [];
        const docRef = db
          .collection("users")
          .doc(user.uid)
          .collection("products");
        const querySnapshot = await docRef.get();
        querySnapshot.forEach((doc) => {
          const { productName, stockPrice, sellPrice, stock, totalStockSold } =
            doc.data();
          fetched.push({
            id: doc.id,
            productName,
            stockPrice,
            sellPrice,
            stock,
            totalStockSold,
          });
        });

        // Update local state only if it's the initial fetch
        if (!initialFetchProduct) {
          setProductList(fetched);
          setInitialFetchProduct(true);
        }
      } catch (error) {
        Toast.show("Error getting data", Toast.SHORT);
      }
    }
  };

  //read customer data
  const readCustomerData = async () => {
    if (user) {
      try {
        const fetched: Customer[] = [];
        const docRef = db
          .collection("users")
          .doc(user.uid)
          .collection("customers");
        const querySnapshot = await docRef.get();
        querySnapshot.forEach((doc) => {
          const { customerName, customerInfo } = doc.data();
          fetched.push({
            id: doc.id,
            customerName,
            customerInfo,
          });
        });
        if (!initialFetchCustomer) {
          setCustomerList(fetched);
          setInitialFetchCustomer(true);
        }
      } catch (error) {
        Toast.show("Error getting data", Toast.SHORT);
      }
    }
  };
  const filteredData = useMemo(() => {
    const filteredItems = products.filter((item) =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sortedFilteredItems = filteredItems.sort((a, b) =>
      a.productName.toString().localeCompare(b.productName.toString())
    );

    return sortedFilteredItems;
  }, [products, searchQuery]);

  const handleSelectItem = (productId: String) => {
    const selectedProduct = products.find((item) => item.id === productId);
    const existingSelectedProduct = selectedProducts.find(
      (item) => item.product.id === productId
    );
    if (selected.includes(productId)) {
      setSelected(selected.filter((item) => item !== productId));
      setSelectedProducts((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
    } else {
      if (selectedProduct?.stock !== 0) {
        setSelected([...selected, productId]);
        setSelectedProducts((prev) =>
          existingSelectedProduct
            ? prev.map((item) =>
                item.product.id === productId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            : [
                ...prev,
                {
                  product: selectedProduct!,
                  quantity: selectedProduct?.stock === 0 ? 0 : 0.5,
                },
              ]
        );
      } else {
        Toast.show(`${selectedProduct.productName} is sold out`, Toast.SHORT);
      }
    }
  };

  const handleQuantity = (productId: string, action: "add" | "reduce") => {
    setSelectedProducts((prev) => {
      const existingSelectedProduct = prev.find(
        (item) => item.product.id === productId
      );

      if (existingSelectedProduct) {
        return prev.map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity:
                  action === "add"
                    ? Math.min(
                        existingSelectedProduct.quantity + 0.5,
                        item.product.stock
                      )
                    : Math.max(existingSelectedProduct.quantity - 0.5, 0.5),
              }
            : item
        );
      } else {
        const selectedProduct = products.find(
          (item) => item.id === productId
        ) as Product;
        return [
          {
            product: selectedProduct,
            quantity: selectedProduct.stock === 0 ? 0 : 0.5,
          },
          ...prev,
        ];
      }
    });
  };

  const handleTotalAmount = (
    summary: { product: Product; quantity: number }[]
  ) => {
    let total = 0;
    summary.forEach(
      (item) => (total += item.product.sellPrice * item.quantity)
    );
    return deliveryFee.current !== 0 ? total + deliveryFee.current : total;
  };

  const handleTotalProfit = (
    summary: { product: Product; quantity: number }[]
  ) => {
    let total = 0;
    summary.forEach(
      (item) =>
        (total +=
          (item.product.sellPrice - item.product.stockPrice) * item.quantity)
    );
    return total;
  };

  const adjustQuantityFromInput = (productId: string, text: string) => {
    setSelectedProducts((prev) => {
      const existingSelectedProduct = prev.find(
        (item) => item.product.id === productId
      );

      if (existingSelectedProduct) {
        const newQuantity = parseFloat(text) || 0;
        const minQuantity = 0.5;
        const maxQuantity = existingSelectedProduct.product.stock;

        // Ensure the new quantity is within the specified range
        const adjustedQuantity = Math.min(
          Math.max(newQuantity, minQuantity),
          maxQuantity
        );

        return prev.map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: adjustedQuantity,
              }
            : item
        );
      } else {
        const selectedProduct = products.find(
          (item) => item.id === productId
        ) as Product;
        return [
          {
            product: selectedProduct,
            quantity: selectedProduct.stock === 0 ? 0 : 0.5,
          },
          ...prev,
        ];
      }
    });
  };

  const handlePreviewModalVisibility = () => {
    if (deliveryFee.current !== 0 && previewModalVisible) {
      Toast.show(
        "Delivery fee will not be removed. Edit it again when you want to make changes",
        Toast.SHORT
      );
    }
    setPreviewModaVisible(!previewModalVisible);
  };
  const captureScreen = async () => {
    try {
      setSnapButtonVisible(false);
      const localUri = await captureRef(modalContentRef, {
        format: "png",
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(localUri);

      if (localUri) {
        Toast.show("Saved to gallery", Toast.SHORT);
        setSnapButtonVisible(true);
      }
    } catch (error) {
      Toast.show(
        `Error capturing or saving image${(error as Error).message})`,
        Toast.SHORT
      );
      console.log(
        `Error capturing or saving image${(error as Error).message})`
      );
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#f7f7f7",
        opacity: previewModalVisible ? 0.1 : 1,
      }}
    >
      <ListComponent
        identifier="pos"
        placeholder="Search Product"
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
        navigateTo="AddReportScreen"
        navigation={navigation}
        params={selectedProducts}
      />

      <FlatList
        style={{ flex: 1 }}
        data={filteredData}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectItem(item.id)}
            style={{
              flex: 1,
              paddingHorizontal: wp("2%"),
              paddingVertical: hp("1%"),
              borderColor: "#af71bd",
              borderWidth: wp("0.8%"),
              borderRadius: wp("2%"),
              marginVertical: hp("0.5%"),
              marginHorizontal: wp("1.5%"),
              backgroundColor:
                item.stock === 0
                  ? "#bab8ba"
                  : selected.includes(item.id)
                  ? "lightgreen"
                  : "white",
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: hp("2%"),
                  fontWeight: "bold",

                  flex: 2,
                }}
              >
                {item.productName}
              </Text>

              <Text style={{ color: "blue", flex: 1 }}>
                Price: ₱{item.sellPrice.toString()}
              </Text>
              <Text style={{ flex: 0.8 }}>Stock: {item.stock.toString()}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      {selectedProducts.length === 0 ? null : (
        <View
          style={{
            flex: 1,
            borderColor: "black",
            borderWidth: wp("0.4"),
            margin: wp("2%"),
          }}
        >
          <Text
            style={{
              fontSize: hp("3%"),
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Summary
          </Text>

          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: wp("3%"),
            }}
          >
            <Text style={[styles.summaryLabel, { flex: 3 }]}>Product name</Text>

            <Text style={[styles.summaryLabel, { flex: 1 }]}>Qty</Text>
            <Text
              style={{
                fontWeight: "500",
                fontSize: hp("1.8%"),
                flex: 2,
                textAlign: "right",
              }}
            >
              Add and Reduce
            </Text>
          </View>

          <FlatList
            data={selectedProducts}
            renderItem={({ item }) => (
              <View style={{ marginVertical: 5 }}>
                <KeyboardAwareScrollView>
                  <View
                    style={{
                      flexDirection: "row",
                      paddingHorizontal: wp("3%"),
                      borderBottomWidth: 1,
                      borderBottomColor: "lightgray",
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      style={{ flex: 3 }}
                      onPress={() => {
                        setSelectedProducts(
                          selectedProducts.filter(
                            (element) => element.product.id !== item.product.id
                          )
                        );
                        setSelected(
                          selected.filter(
                            (element) => element !== item.product.id
                          )
                        );
                        setQuantityInput((prevQuantityInput) => ({
                          ...prevQuantityInput,
                          [item.product.id.toString()]: "0.5",
                        }));
                      }}
                    >
                      <Text>{item.product.productName}</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={{
                        flex: 1,
                      }}
                      placeholder={`${item.quantity}`}
                      value={
                        isEditing
                          ? quantityInput[item.product.id.toString()] !==
                            undefined
                            ? quantityInput[item.product.id.toString()]
                            : item.quantity.toString()
                          : item.quantity.toString()
                      }
                      onFocus={() => setIsEditing(true)}
                      onBlur={() => setIsEditing(false)}
                      onChangeText={(text) =>
                        setQuantityInput((prev) => ({
                          ...prev,
                          [item.product.id.toString()]: text,
                        }))
                      }
                      onSubmitEditing={() => {
                        const submittedValue =
                          quantityInput[item.product.id.toString()] || "0";
                        const clampedValue = Math.min(
                          Math.max(parseFloat(submittedValue), 0.5),
                          item.product.stock
                        );
                        setQuantityInput((prev) => ({
                          ...prev,
                          [item.product.id.toString()]: clampedValue.toString(),
                        }));
                        adjustQuantityFromInput(
                          item.product.id.toString(),
                          clampedValue.toString()
                        );
                        setIsEditing(false);
                      }}
                      keyboardType="numeric"
                    />
                    <View
                      style={{
                        flex: 2,
                        flexDirection: "row",
                        justifyContent: "flex-end",
                      }}
                    >
                      <TouchableOpacity style={styles.touchableStyle}>
                        <Ionicons
                          name="remove"
                          size={24}
                          color="white"
                          onPress={() =>
                            handleQuantity(item.product.id.toString(), "reduce")
                          }
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.touchableStyle}
                        onPress={() =>
                          handleQuantity(item.product.id.toString(), "add")
                        }
                      >
                        <Ionicons name="add" size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </KeyboardAwareScrollView>
              </View>
            )}
          />

          <View
            style={{
              flexDirection: "row",

              justifyContent: "space-between",
            }}
          >
            <View style={{ marginLeft: wp("1%") }}>
              <Text>
                Total: ₱{handleTotalAmount(selectedProducts).toFixed(2)}
              </Text>
              <Text>
                Total profit: ₱{handleTotalProfit(selectedProducts).toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={{
                padding: wp("2%"),
                backgroundColor: "#af71bd",
                borderRadius: wp("5%"),
                marginRight: wp("5%"),
                bottom: hp("1%"),
              }}
              onPress={handlePreviewModalVisibility}
            >
              <Fontisto name="preview" size={20} color="white" />
            </TouchableOpacity>

            <Modal
              visible={previewModalVisible}
              transparent
              animationType="slide"
              onRequestClose={handlePreviewModalVisibility}
            >
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: wp("5%"),
                  padding: wp("5%"),
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  elevation: wp("2%"),
                  flex: 1,
                  opacity: showDeliveryFeeModal ? 0.5 : 1,
                }}
                ref={modalContentRef}
              >
                <View
                  style={{
                    flexDirection: "row",
                    paddingHorizontal: wp("3%"),
                  }}
                >
                  <Text style={[styles.summaryLabel, { flex: 3 }]}>
                    Product name
                  </Text>

                  <Text style={[styles.summaryLabel, { flex: 1 }]}>Qty</Text>
                  <Text style={[styles.summaryLabel, { flex: 1 }]}>Price</Text>
                </View>
                <FlatList
                  style={{ height: hp("60%") }}
                  data={selectedProducts}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        flexDirection: "row",
                        paddingHorizontal: wp("3%"),
                        borderBottomWidth: 1,
                        borderBottomColor: "lightgray",
                      }}
                    >
                      <View style={{ flex: 3 }}>
                        <Text>{item.product.productName}</Text>
                      </View>
                      <Text
                        style={{
                          flex: 1,
                        }}
                      >
                        {item.quantity}
                      </Text>
                      <Text style={{ flex: 1 }}>
                        {(
                          item.product.sellPrice * (item.quantity as number)
                        ).toFixed(2)}
                      </Text>
                    </View>
                  )}
                />

                {deliveryFee.current !== 0 ? (
                  <Text style={{ fontSize: hp(3), fontWeight: "bold" }}>
                    Delivery Fee: ₱{deliveryFee.current.toFixed(2)}
                  </Text>
                ) : null}

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: hp("4%"), fontWeight: "bold" }}>
                    Total: ₱{handleTotalAmount(selectedProducts).toFixed(2)}
                  </Text>
                  {snapButtonVisible ? (
                    <View
                      style={{
                        flexDirection: "row",
                        flex: 1,
                        justifyContent: "space-evenly",
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          padding: wp("2%"),
                          backgroundColor: "#af71bd",
                          borderRadius: wp(12 / 2),
                        }}
                        onPress={() => setShowDeliveryFeeModal(true)}
                      >
                        <MaterialIcons
                          name="delivery-dining"
                          size={24}
                          color="white"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          padding: wp("2%"),
                          backgroundColor: "#af71bd",
                          borderRadius: wp(12 / 2),
                        }}
                        onPress={captureScreen}
                      >
                        <Entypo name="camera" size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              </View>
            </Modal>
          </View>

          <Modal
            visible={showDeliveryFeeModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDeliveryFeeModal(false)}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                  style={styles.modalContainer}
                >
                  <View style={styles.modalContent}>
                    <View style={styles.inputContainer}>
                      <Text>Add Delivery Fee:</Text>
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        value={editDeliverFee}
                        onChangeText={(text) => setEditDeliveryFee(text)}
                        placeholder="Enter delivery fee"
                      />
                    </View>
                    <TouchableOpacity
                      style={{ alignItems: "center", marginTop: hp(3) }}
                      onPress={() => {
                        setShowDeliveryFeeModal(false);
                        deliveryFee.current = !editDeliverFee.trim()
                          ? 0
                          : parseFloat(editDeliverFee);
                      }}
                    >
                      <Text style={{ color: "blue", fontSize: hp(2) }}>
                        Confirm
                      </Text>
                    </TouchableOpacity>
                  </View>
                </KeyboardAvoidingView>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      )}
    </SafeAreaView>
  );
};

export default PosScreen;

const styles = StyleSheet.create({
  summaryLabel: {
    fontWeight: "500",
    fontSize: hp("1.8%"),
    marginBottom: 10,
  },
  touchableStyle: {
    backgroundColor: "#af71bd",
    borderRadius: wp("2%"),
    marginRight: wp("2%"),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    justifyContent: "center",
    marginVertical: hp(10),
    marginHorizontal: wp(10),
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: wp(5),
    padding: wp(5),
    shadowColor: "#000",
    shadowOpacity: 0.2,
    elevation: wp(2),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: wp(2),
  },
  textInput: {
    borderBottomWidth: wp(0.1),
    flex: 1,
    marginLeft: wp(2),
  },
});
