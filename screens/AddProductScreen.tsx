import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input } from "@rneui/base";
import { useState } from "react";
import { auth, db } from "../firebaseconfig";
import Toast from "react-native-simple-toast";
import { ProductRootStackParamList, Product } from "../type";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useProductContext } from "../context/productContext";

type Props = NativeStackScreenProps<
  ProductRootStackParamList,
  "AddProductScreen"
>;

const AddProductScreen = ({ navigation }: Props) => {
  const { addProduct } = useProductContext();
  const [productName, setProductName] = useState("");
  const [stockPrice, setStockPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  const addData = async () => {
    if (productName && stockPrice && sellPrice) {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = await db
            .collection("users")
            .doc(user.uid)
            .collection("products")
            .add({
              productName: productName,
              stockPrice: parseFloat(stockPrice),
              sellPrice: parseFloat(sellPrice),
              stock: 0,
              totalStockSold: 0,
            });
          const newProduct: Product = {
            id: docRef.id,
            productName,
            stockPrice: parseFloat(stockPrice),
            sellPrice: parseFloat(sellPrice),
            stock: 0,
            totalStockSold: 0,
          };

          // Use the addProduct function from the context to update the state
          addProduct(newProduct);

          console.log("Document written with ID: ", docRef.id);
          Toast.show("Added successfully", Toast.SHORT);
          navigation.pop();
        }
      } catch (error) {
        console.log("Error adding data: ", error as Error);
      }
    } else {
      Toast.show("Please complete the missing fields", Toast.SHORT);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#f7f7f7" }}>
      <View>
        <Text style={styles.textStyle}>Add a Product</Text>
        <Text style={styles.labelStyle}>Product name:</Text>
        <Input
          placeholder="Product Name"
          style={styles.inputContainerStyle}
          inputContainerStyle={{ borderColor: "white" }}
          value={productName}
          onChangeText={(text) => {
            setProductName(text);
          }}
        />
        <Text style={styles.labelStyle}>Stock price:</Text>
        <Input
          placeholder="Stock Price"
          style={styles.inputContainerStyle}
          inputContainerStyle={{ borderColor: "white" }}
          keyboardType="number-pad"
          value={stockPrice}
          onChangeText={(text) => setStockPrice(text)}
        />
        <Text style={styles.labelStyle}>Sell price:</Text>
        <Input
          placeholder="Sell Price"
          style={styles.inputContainerStyle}
          inputContainerStyle={{ borderColor: "white" }}
          keyboardType="number-pad"
          value={sellPrice}
          onChangeText={(text) => setSellPrice(text)}
        />
        <Button
          title={"Confirm"}
          buttonStyle={{ backgroundColor: "#af71bd" }}
          containerStyle={{
            marginHorizontal: 10,
            borderRadius: 10,
          }}
          onPress={addData}
        />
        <Button
          title={"Cancel"}
          buttonStyle={{ backgroundColor: "#af71bd" }}
          containerStyle={{
            marginTop: 20,
            marginHorizontal: 10,
            borderRadius: 10,
          }}
          onPress={navigation.popToTop}
        />
      </View>
    </SafeAreaView>
  );
};

export default AddProductScreen;

const styles = StyleSheet.create({
  textStyle: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "500",
    marginTop: 20,
    color: "#af71bd",
  },

  inputContainerStyle: {
    borderWidth: 5,
    borderColor: "#af71bd",
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 20,
  },
  labelStyle: {
    marginTop: 20,
    paddingHorizontal: 20,
    fontSize: 20,
  },
});
