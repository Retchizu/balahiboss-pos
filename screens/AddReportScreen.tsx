import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { Customer, PosRootStackParamList, Product } from "../type";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, SearchBar } from "@rneui/base";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { auth, db } from "../firebaseconfig";
import Toast from "react-native-simple-toast";
import { useProductContext } from "../context/productContext";
import { useCustomerContext } from "../context/customerContext";
import { useSalesReportContext } from "../context/salesReportContext";
import SelectCustomerModalComponent from "../components/SelectCustomerModalComponent";

type AddReportScreenProp = {
  route: RouteProp<PosRootStackParamList, "AddReportScreen">;
};

const AddReportScreen: React.FC<AddReportScreenProp> = ({
  route,
}: AddReportScreenProp) => {
  const items = Object.values(route.params || []);

  const navigation = useNavigation();
  const [date, setDate] = useState<Date>(new Date());
  const [show, setShow] = useState(false);
  const [additionalExpense, setAdditionalExpense] = useState("");
  const [dogTreatDiscount, setDogTreatDiscount] = useState("");
  const [catTreatDiscount, setCatTreatDiscount] = useState("");
  const [gateDiscount, setGateDiscount] = useState("");
  const [selected, setSelected] = useState<Customer | undefined>(undefined);
  const [customerPayment, setCustomerPayment] = useState("");
  const { products, updateProduct } = useProductContext();
  const [componentVisible, setComponentVisible] = useState(false);
  const [addComponentVisible, setAddComponentVisible] = useState(false);
  const { customers } = useCustomerContext();
  const { addSalesReport } = useSalesReportContext();
  const [buttonVisible, setButtonVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { addCustomer } = useCustomerContext();
  const [customerName, setCustomerName] = useState("");
  const [customerInfo, setCustomerInfo] = useState("");

  const addData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = await db
          .collection("users")
          .doc(user.uid)
          .collection("sales")
          .add({
            customer: selected,
            productList: items,
            date,
            otherExpense: !additionalExpense
              ? 0
              : parseFloat(additionalExpense),
            catTreatDiscount: !catTreatDiscount
              ? 0
              : parseFloat(catTreatDiscount),
            dogTreatDiscount: !dogTreatDiscount
              ? 0
              : parseFloat(dogTreatDiscount),
            gateDiscount: !gateDiscount ? 0 : parseFloat(gateDiscount),
            customerPayment: !customerPayment
              ? totalAmount()
              : parseFloat(customerPayment),
          });
        if (docRef.id) {
          await Promise.all(
            findObjectMatch(items, products).map(async (item) => {
              const newTotalStockSold =
                item.product.totalStockSold + (item.quantity as number);
              const stockReduce =
                item.product.stock - (item.quantity as number);
              const productRef = db
                .collection("users")
                .doc(user.uid)
                .collection("products")
                .doc(item.product.id.toString());

              await productRef.update({
                totalStockSold: newTotalStockSold,
                stock: stockReduce,
              });

              updateProduct(item.product.id, {
                totalStockSold: newTotalStockSold,
                stock: stockReduce,
              });
            })
          );
          const newSalesReport = {
            id: docRef.id,
            customer: selected,
            productList: items,
            date,
            otherExpense: !additionalExpense
              ? 0
              : parseFloat(additionalExpense),
            catTreatDiscount: !catTreatDiscount
              ? 0
              : parseFloat(catTreatDiscount),
            dogTreatDiscount: !dogTreatDiscount
              ? 0
              : parseFloat(dogTreatDiscount),
            gateDiscount: !gateDiscount ? 0 : parseFloat(gateDiscount),
            customerPayment: !customerPayment
              ? totalAmount()
              : parseFloat(customerPayment),
          };
          addSalesReport(newSalesReport);
        }
      }
      Toast.show("Added Successfully", Toast.SHORT);
    } catch (error) {
      Toast.show((error as Error).message, Toast.SHORT);
    } finally {
      navigation.goBack();
    }
  };

  const showDatepicker = () => {
    setShow(!show);
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      const currentDate = selectedDate;
      setDate(currentDate);
      if (Platform.OS === "android") {
        showDatepicker();
        setDate(currentDate);
      }
    } else {
      showDatepicker();
    }
  };

  const confirmIosDate = () => {
    setDate(date);
    showDatepicker();
  };

  const formatDateString = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const totalAmount = () => {
    let total = 0;
    items.forEach(
      (item) => (total += item.product.sellPrice * (item.quantity as number))
    );
    total = total - (!additionalExpense ? 0 : parseFloat(additionalExpense));
    return total;
  };

  const totalProfit = () => {
    let total = 0;
    items.forEach(
      (item) =>
        (total +=
          (item.product.sellPrice - item.product.stockPrice) *
          (item.quantity as number))
    );
    total =
      total -
      (!additionalExpense ? 0 : parseFloat(additionalExpense)) -
      (!dogTreatDiscount ? 0 : parseFloat(dogTreatDiscount)) -
      (!catTreatDiscount ? 0 : parseFloat(catTreatDiscount)) -
      (!gateDiscount ? 0 : parseFloat(gateDiscount));
    return total;
  };

  const findObjectMatch = (
    array1: readonly { product: Product; quantity: Number }[],
    array2: Product[]
  ) => {
    return array1.filter((obj1) =>
      array2.some((obj2) => obj1.product["id"] === obj2["id"])
    );
  };

  const computeChange = () => {
    return parseFloat(customerPayment) - totalAmount();
  };

  const handleComponentVisibility = () => {
    setComponentVisible(!componentVisible);
    setButtonVisible(false);
  };

  const filteredData = () => {
    const filtered = customers.filter((item) =>
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.sort((a, b) =>
      a.customerName.localeCompare(b.customerName.toString())
    );
  };

  const addDataCustomer = async () => {
    try {
      if (customerName) {
        const user = auth.currentUser;
        if (user) {
          const docRef = await db
            .collection("users")
            .doc(user.uid)
            .collection("customers")
            .add({
              customerName,
              customerInfo,
            });

          const newCustomer: Customer = {
            id: docRef.id,
            customerName,
            customerInfo,
          };

          addCustomer(newCustomer);
          setSelected(newCustomer);
        } else {
          Toast.show("Customer name should not be empty", Toast.SHORT);
        }
        Toast.show("Added successfully", Toast.SHORT);
      }
      setAddComponentVisible(false);
      setComponentVisible(false);
      setButtonVisible(true);
    } catch (error) {
      Toast.show(
        `Error adding data: please try again later, Error cause: ${
          (error as Error).message
        }`,
        Toast.SHORT
      );
    }
  };

  console.log(items.length);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, opacity: componentVisible ? 0.1 : 1 }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#f7f7f7",
          paddingHorizontal: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <ScrollView style={{ backgroundColor: "white" }}>
            <View style={{ flexDirection: "row", marginBottom: 20 }}>
              <Text
                style={{
                  flex: 3,
                  fontWeight: "500",
                  fontSize: 18,
                  marginBottom: 10,
                }}
              >
                Product name
              </Text>
              <Text style={styles.summaryLabel}>Price</Text>
              <Text style={styles.summaryLabel}>Quantity</Text>
            </View>
            <View style={{ marginBottom: 20 }}>
              {items.map((item, index) => (
                <View style={{ flexDirection: "row" }} key={index.toString()}>
                  <Text
                    style={{
                      flex: 3,
                      borderBottomWidth: 1,
                      borderBottomColor: "gray",
                      fontSize: 16,
                    }}
                  >
                    {item.product.productName}
                  </Text>
                  <Text style={[styles.item, { color: "blue" }]}>
                    ₱
                    {(
                      item.product.sellPrice * (item.quantity as number)
                    ).toFixed(2)}
                  </Text>
                  <Text style={[styles.item, { textAlign: "center" }]}>
                    {item.quantity.toString()}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        <View
          style={{
            borderStyle: "dotted",
            borderWidth: 3,
            borderColor: "#af71bd",
            padding: 5,
            justifyContent: "flex-end",
            marginBottom: 5,
          }}
        >
          <SelectCustomerModalComponent
            addComponentVisible={addComponentVisible}
            setAddComponentVisible={setAddComponentVisible}
            addDataCustomer={addDataCustomer}
            componentVisible={componentVisible}
            customerInfo={customerInfo}
            setCustomerInfo={setCustomerInfo}
            customerName={customerName}
            setCustomerName={setCustomerName}
            filteredData={filteredData}
            handleComponentVisibility={handleComponentVisibility}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setButtonVisible={setButtonVisible}
            setSelected={setSelected}
          />
          <View>
            <View
              style={{
                flexDirection: "row",

                marginVertical: hp("0.5%"),
              }}
            >
              <Text style={{ fontSize: hp("2%"), alignSelf: "center" }}>
                Customer's payment:
              </Text>
              <TextInput
                placeholder="customer's payment"
                style={{
                  fontSize: hp("2%"),
                  marginLeft: wp("1%"),
                  flex: 1,
                  borderColor: "#af71bd",
                  borderWidth: wp("0.5%"),
                  paddingHorizontal: wp("1%"),
                }}
                value={customerPayment}
                onChangeText={(text) => setCustomerPayment(text)}
                keyboardType="numeric"
              />
            </View>
            <Text style={{ fontSize: hp("2%") }}>
              Customer's change:{" "}
              {!customerPayment ? "₱0" : `₱${computeChange().toFixed(2)}`}
            </Text>
            <Text style={{ marginVertical: hp("0.5%"), fontSize: hp("2%") }}>
              Total price: ₱{totalAmount().toFixed(2)}
            </Text>
            <Text style={{ marginVertical: hp("0.5%"), fontSize: hp("2%") }}>
              Total profit: ₱{totalProfit().toFixed(2)}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: hp("0.5%"),
              }}
            >
              <Text style={{ fontSize: hp("2%") }}>Customer: </Text>

              <Button
                title={
                  selected
                    ? selected.customerName.toString()
                    : "Select Customer"
                }
                onPress={
                  //navigation.navigate("SelectCustomerScreen" as never)
                  handleComponentVisibility
                }
                containerStyle={{ borderRadius: wp("2%"), flex: 1 }}
                titleStyle={{ fontSize: hp("1.7%") }}
                buttonStyle={{ backgroundColor: "#af71bd" }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 5,
              }}
            >
              <Text style={{ fontSize: 16 }}>Date bought: </Text>
              <Button
                title={`${formatDateString(date)}`}
                onPress={() => setShow(true)}
                containerStyle={{ borderRadius: wp("2%"), flex: 1 }}
                titleStyle={{ fontSize: hp("1.7%") }}
                buttonStyle={{ backgroundColor: "#af71bd" }}
              />

              {show && (
                <DateTimePicker
                  mode="date"
                  display="calendar"
                  value={date}
                  onChange={onChange}
                  minimumDate={new Date(2016, 0, 1)}
                />
              )}
              {show && Platform.OS === "ios" && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                  }}
                >
                  <Button
                    title={"Cancel"}
                    containerStyle={{
                      borderRadius: wp("2%"),
                      flex: 1,
                      marginHorizontal: 20,
                    }}
                    buttonStyle={{ backgroundColor: "#af71bd" }}
                    onPress={showDatepicker}
                  />
                  <Button
                    title={"Confirm"}
                    containerStyle={{
                      borderRadius: 10,
                      flex: 1,
                      marginHorizontal: 20,
                    }}
                    buttonStyle={{ backgroundColor: "#af71bd" }}
                    onPress={confirmIosDate}
                  />
                </View>
              )}
            </View>

            <View
              style={{
                flexDirection: "row",
                marginVertical: hp("0.5%"),
              }}
            >
              <Text style={{ fontSize: hp("2%"), alignSelf: "center" }}>
                Discount:
              </Text>
              <TextInput
                placeholder="discount"
                style={styles.discount}
                keyboardType="number-pad"
                value={additionalExpense}
                onChangeText={(text) => setAdditionalExpense(text)}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                marginVertical: hp("0.5%"),
              }}
            >
              <Text
                style={{
                  fontSize: hp("2%"),
                  alignSelf: "center",
                }}
              >
                Dog Treat Discount:
              </Text>
              <TextInput
                placeholder="dog treat discount"
                style={styles.discount}
                keyboardType="number-pad"
                value={dogTreatDiscount}
                onChangeText={(text) => setDogTreatDiscount(text)}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                marginVertical: hp("0.5%"),
              }}
            >
              <Text
                style={{
                  fontSize: hp("2%"),
                  alignSelf: "center",
                }}
              >
                Cat Treat Discount:
              </Text>
              <TextInput
                placeholder="cat treat discount"
                style={styles.discount}
                keyboardType="number-pad"
                value={catTreatDiscount}
                onChangeText={(text) => setCatTreatDiscount(text)}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                marginVertical: hp("0.5%"),
              }}
            >
              <Text
                style={{
                  fontSize: hp("2%"),
                  alignSelf: "center",
                }}
              >
                Gate Discount:
              </Text>
              <TextInput
                placeholder="gate discount"
                style={styles.discount}
                keyboardType="number-pad"
                value={gateDiscount}
                onChangeText={(text) => setGateDiscount(text)}
              />
            </View>
          </View>

          {buttonVisible ? (
            <View
              style={{
                marginVertical: hp("2%"),
                flexDirection: "row",
              }}
            >
              <Button
                title={"Cancel"}
                buttonStyle={{ backgroundColor: "#af71bd" }}
                containerStyle={{
                  borderRadius: wp("2%"),
                  flex: 1,
                  marginHorizontal: wp("5%"),
                }}
                onPress={navigation.goBack}
              />
              <Button
                title={"Confirm"}
                buttonStyle={{ backgroundColor: "#af71bd" }}
                containerStyle={{
                  borderRadius: wp("2%"),
                  flex: 1,
                  marginHorizontal: wp("5%"),
                }}
                onPress={() => {
                  if (selected && items.length !== 0) {
                    addData();
                  } else if (items.length === 0) {
                    Toast.show(
                      "Please select a product from the pos",
                      Toast.SHORT
                    );
                  } else if (!selected) {
                    Toast.show("Customer is empty", Toast.SHORT);
                  }
                }}
              />
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default AddReportScreen;

const styles = StyleSheet.create({
  summaryLabel: {
    fontWeight: "500",
    fontSize: hp("2.3$%"),
    marginBottom: hp("1%"),
    flex: 1,
  },
  item: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  discount: {
    flex: 1,
    fontSize: 14,
    marginLeft: 5,
    borderColor: "#af71bd",
    borderWidth: 2,
    paddingHorizontal: 5,
  },
  textStyle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "500",
    marginTop: 20,
    color: "pink",
  },

  inputContainerStyle: {
    borderWidth: 5,
    borderColor: "pink",
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 50,
  },
  labelStyle: {
    marginHorizontal: 5,
    paddingHorizontal: 20,
    fontSize: 14,
  },
});
