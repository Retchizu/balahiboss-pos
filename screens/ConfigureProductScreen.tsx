import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { RouteProp } from "@react-navigation/native";
import { ProductRootStackParamList } from "../type";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@rneui/base";
import Dialog from "react-native-dialog";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebaseconfig";
import Toast from "react-native-simple-toast";
import { useProductContext } from "../context/productContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
type ConfigureProductScreenProps = {
  route: RouteProp<ProductRootStackParamList, "ConfigureProductScreen">;
};

type ProductInfoItem = {
  key: String;
  label: String;
  value: String;
};

const ConfigureProductScreen: React.FC<ConfigureProductScreenProps> = ({
  route,
}: ConfigureProductScreenProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isBuyStockVisible, setIsBuyStockVisible] = useState(false);
  const { item } = route.params;
  const navigation = useNavigation();
  const { updateProduct, addProduct, products } = useProductContext();

  //update attribute state
  const [productName, setProductName] = useState(item.productName);
  const [stockPrice, setStockPrice] = useState(item.stockPrice.toString());
  const [sellPrice, setSellPrice] = useState(item.sellPrice.toString());
  const [stock, setStock] = useState(item.stock.toString());
  const [newStock, setNewStock] = useState("");
  const user = auth.currentUser;

  //edit attribute state

  const [editProductName, setEditProductName] = useState("");
  const [editStockPrice, setEditStockPrice] = useState("");
  const [editSellPrice, setEditSellPrice] = useState("");
  const [editStock, setEditStock] = useState("");

  useEffect(() => {
    if (!products.find((product) => product.id === item.id)) {
      addProduct(item);
    }
  }, []);
  //selected data
  const productInfo: ProductInfoItem[] = [
    { key: "productName", label: "Product name", value: productName },
    {
      key: "stockPrice",
      label: "Stock price",
      value: `₱${stockPrice}`,
    },
    {
      key: "sellPrice",
      label: "Sell price",
      value: `₱${sellPrice}`,
    },
    { key: "stock", label: "Stock", value: stock },
  ];

  //dialog functions
  const handleEditPress = () => {
    toggleModal();
    setEditProductName(item.productName.toString());
    setEditStockPrice(item.stockPrice.toString());
    setEditSellPrice(item.sellPrice.toString());
    setEditStock(item.stock.toString());
  };

  const toggleModal = () => {
    setIsVisible(!isVisible);
  };

  const toggleBuyStockModal = () => {
    setIsBuyStockVisible(!isBuyStockVisible);
  };
  //buy stock function
  const buyStock = async (addedStock: number) => {
    const newStock = parseFloat(stock) + addedStock;

    try {
      if (user) {
        const docRef = db
          .collection("users")
          .doc(user.uid)
          .collection("products")
          .doc(item.id.toString());
        await docRef.update({
          stock: newStock,
        });
        Toast.show("Added Successfully", Toast.SHORT);
        setIsBuyStockVisible(false);
        setStock(newStock.toString());
        updateProduct(item.id, { stock: newStock });
        setNewStock("");

        console.log(item);
      }
    } catch (error) {
      Toast.show((error as Error).message, Toast.SHORT);
    }
  };

  const handleBuyStockCancel = () => {
    setIsBuyStockVisible(false);
    setStock(item.stock.toString());
  };
  const handleConfirmBuyStock = (productId: String, addedStock: number) => {
    setIsBuyStockVisible(true);
    buyStock(addedStock);
    updateProduct(productId, { stock: addedStock });
  };

  //update attribute
  const updateAttribute = async () => {
    if (user) {
      const docRef = db
        .collection("users")
        .doc(user.uid)
        .collection("products")
        .doc(item.id.toString());
      await docRef.update({
        productName: editProductName,
        stockPrice: parseFloat(editStockPrice),
        sellPrice: parseFloat(editSellPrice),
        stock: parseFloat(editStock),
      });

      updateProduct(item.id, {
        productName: editProductName,
        stockPrice: parseFloat(editStockPrice),
        sellPrice: parseFloat(editSellPrice),
        stock: parseFloat(editStock),
      });
    }

    setProductName(editProductName);
    setStockPrice(editStockPrice);
    setSellPrice(editSellPrice);
    setStock(editStock);
    toggleModal();
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#f7f7f7",
        opacity: isVisible || isBuyStockVisible ? 0.1 : 1,
      }}
    >
      {productInfo.map((item) => (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderBottomWidth: 2,
            borderBottomColor: "gray",
          }}
          key={item.key.toString()}
        >
          <Text style={styles.infoStyle}>
            {item.label}: {item.value}
          </Text>

          <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={toggleModal}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginHorizontal: wp("20%"),
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: wp("5%"),
                  padding: wp("5%"),
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  elevation: wp("2%"),
                }}
              >
                <Text style={{ fontSize: hp("2.3%"), fontWeight: "500" }}>
                  Edit Product
                </Text>
                <View
                  style={{
                    backgroundColor: "white",
                    marginTop: hp("2%"),
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <Text style={{ fontSize: hp("2.3%") }}>Product Name:</Text>
                    <TextInput
                      style={{
                        width: wp("40%"),
                        borderBottomWidth: wp("0.1%"),
                        marginLeft: wp("2%"),
                        fontSize: hp("2.3%"),
                        borderColor: "gray",
                      }}
                      value={editProductName}
                      onChangeText={(text) => setEditProductName(text)}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <Text style={{ fontSize: hp("2.3%") }}>Stock Price:</Text>
                    <TextInput
                      style={{
                        width: wp("40%"),
                        borderBottomWidth: wp("0.1%"),
                        marginLeft: wp("2%"),
                        fontSize: hp("2.3%"),
                        borderColor: "gray",
                        flex: 1,
                      }}
                      value={editStockPrice}
                      onChangeText={(text) => setEditStockPrice(text)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <Text style={{ fontSize: hp("2.3%") }}>Sell Price:</Text>
                    <TextInput
                      style={{
                        width: wp("40%"),
                        borderBottomWidth: wp("0.1%"),
                        marginLeft: wp("2%"),
                        fontSize: hp("2.3%"),
                        borderColor: "gray",
                        flex: 1,
                      }}
                      value={editSellPrice}
                      onChangeText={(text) => setEditSellPrice(text)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <Text style={{ fontSize: hp("2.3%") }}>Stock:</Text>
                    <TextInput
                      style={{
                        width: wp("40%"),
                        borderBottomWidth: wp("0.1%"),
                        marginLeft: wp("2%"),
                        fontSize: hp("2.3%"),
                        borderColor: "gray",
                        flex: 1,
                      }}
                      value={editStock}
                      onChangeText={(text) => setEditStock(text)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: hp("5%"),
                  }}
                >
                  <TouchableOpacity
                    onPress={toggleModal}
                    style={{ marginRight: wp("5%") }}
                  >
                    <Text style={{ fontSize: hp("2%"), color: "blue" }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={updateAttribute}>
                    <Text style={{ fontSize: hp("2%"), color: "blue" }}>
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      ))}
      <View style={{ alignItems: "center", marginTop: hp("2%") }}>
        <Button
          title={"Edit Product"}
          buttonStyle={{
            backgroundColor: "pink",
            borderRadius: wp("3%"),
            width: wp("60%"),
          }}
          onPress={handleEditPress}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          marginTop: hp("10%"),
        }}
      >
        <Button
          title={"Cancel "}
          buttonStyle={{
            backgroundColor: "pink",
            borderRadius: wp("3%"),
            width: wp("40%"),
          }}
          onPress={navigation.goBack}
        />
        <Button
          title={"Buy Stock"}
          buttonStyle={{
            backgroundColor: "pink",
            borderRadius: wp("3%"),
            width: wp("40%"),
          }}
          onPress={toggleBuyStockModal}
        />

        <Modal
          visible={isBuyStockVisible}
          transparent
          animationType="fade"
          onRequestClose={toggleBuyStockModal}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginHorizontal: wp("20%"),
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: wp("5%"),
                padding: wp("5%"),
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.2,
                elevation: wp("2%"),
              }}
            >
              <Text style={{ fontSize: hp("2.3%"), fontWeight: "500" }}>
                Buy Stock
              </Text>
              <View
                style={{
                  backgroundColor: "white",
                  marginTop: hp("2%"),
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                  }}
                >
                  <Text style={{ fontSize: hp("2.3%") }}>
                    Stocks to be added:
                  </Text>
                  <TextInput
                    style={{
                      width: wp("40%"),
                      borderBottomWidth: wp("0.1%"),
                      marginLeft: wp("2%"),
                      fontSize: hp("2.3%"),
                      borderColor: "gray",
                    }}
                    value={newStock}
                    onChangeText={(text) => setNewStock(text)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: hp("5%"),
                }}
              >
                <TouchableOpacity
                  onPress={handleBuyStockCancel}
                  style={{ marginRight: wp("5%") }}
                >
                  <Text style={{ fontSize: hp("2%"), color: "blue" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    handleConfirmBuyStock(item.id, parseFloat(newStock))
                  }
                >
                  <Text style={{ fontSize: hp("2%"), color: "blue" }}>
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <Text style={{ margin: 10 }}>
        Modifying stock itself is not recommended, use buy stock instead.
      </Text>
    </SafeAreaView>
  );
};

export default ConfigureProductScreen;

const styles = StyleSheet.create({
  infoStyle: {
    fontSize: 16,
    marginHorizontal: 5,
    marginVertical: 20,
    maxWidth: "80%",
  },
});
