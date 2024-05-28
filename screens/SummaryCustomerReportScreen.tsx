import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Modal,
  Platform,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { Button, SearchBar } from "@rneui/base";
import { Entypo } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import Dialog from "react-native-dialog";
import Toast from "react-native-simple-toast";

import { auth, db } from "../firebaseconfig";
import { Customer, Product, ReportRootStackParamList } from "../type";
import { useSalesReportContext } from "../context/salesReportContext";
import { useProductContext } from "../context/productContext";
import { useCustomerContext } from "../context/customerContext";

import AnimatedFloatingButton from "../components/AnimatedFloatingButton";
import EditTextComponent from "../components/EditTextComponent";
import SelectCustomerModalComponent from "../components/SelectCustomerModalComponent";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ScrollView } from "react-native-virtualized-view";

type SummaryCustomerReportSreenProp = {
  route: RouteProp<ReportRootStackParamList, "SummaryCustomerReportScreen">;
};
const SummaryCustomerReportScreen = ({
  route,
}: SummaryCustomerReportSreenProp) => {
  const [item, setItem] = useState(route.params);
  const itemDate =
    typeof item.date === "string" ? new Date(item.date) : item.date;

  const user = auth.currentUser;
  const userName = auth.currentUser?.displayName;
  const [isVisible, setIsVisible] = useState(false);
  const { salesReports, setSalesReportList, updateSalesReport } =
    useSalesReportContext();
  const { products, updateProduct } = useProductContext();
  const navigation = useNavigation();
  const [floatingButtonOpacity, setFloatingButtonOpacity] = useState(1);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  //edit states
  const [editDate, setEditDate] = useState<Date>(itemDate);
  const [editCustomerPayment, setEditCustomerPayment] = useState(
    item.customerPayment.toString()
  );
  const [editDiscount, setEditDiscount] = useState(
    item.otherExpense.toString()
  );
  const [editDogTreatDiscount, setEditDogTreatDiscount] = useState(
    item.dogTreatDiscount.toString()
  );
  const [editCatTreatDiscount, setEditCatTreatDiscount] = useState(
    item.catTreatDiscount.toString()
  );
  const [editGateDiscount, setEditGateDiscount] = useState(
    item.gateDiscount.toString()
  );
  const [editProductsList, setEditProductList] = useState(item.productList);
  const [editSelectedCustomer, setEditSelectedCustomer] = useState<
    Customer | undefined
  >(item.customer);

  //selection of edit products
  const [componentVisible, setComponentVisible] = useState(false);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState<String[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    { product: Product; quantity: number }[]
  >([]);
  const [quantityInput, setQuantityInput] = useState<{
    [productId: string]: string;
  }>({});
  const [
    isDialogProductConfirmationVisible,
    setIsDialogProductConfirmationVisible,
  ] = useState(false);
  const [IsEditProductsBoughtVisible, setIstEditProductsBoughtVisible] =
    useState(false);
  const [
    isEditCustomerReportConfirmationVisible,
    setIsEditCustomerReportConfirmationVisible,
  ] = useState(false);

  //for selecting edit customer
  const [addComponentVisible, setAddComponentVisible] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerInfo, setCustomerInfo] = useState("");
  const [buttonVisible, setButtonVisible] = useState(true);
  const { customers, addCustomer } = useCustomerContext();
  const [editTotalProfit, setEditTotalProfit] = useState(0);
  const [editTotalAmount, setEditTotalAmount] = useState(0);
  const [draftProductList, setDraftProductList] = useState(
    products.map((item) => {
      const selectedProduct = selectedProducts.find(
        (itemSelected) => itemSelected.product.id === item.id
      );
      return selectedProduct
        ? { ...item, stock: item.stock + selectedProduct.quantity }
        : item;
    })
  );

  const [isScrolling, setIsScrolling] = useState(false);
  const deleteData = async (reportId: String) => {
    try {
      const user = auth.currentUser;
      await db
        .collection("users")
        .doc(user?.uid)
        .collection("sales")
        .doc(reportId.toString())
        .delete();

      const updatedData = salesReports.filter(
        (element) => element.id !== reportId
      );
      setSalesReportList(updatedData);
      item.productList.forEach((item) => {
        const productItem = products.find(
          (product) => product.id == item.product.id
        );
        const updatedTotalStockSold =
          productItem?.totalStockSold! - (item.quantity as number);
        const updatedStock = productItem?.stock! + (item.quantity as number);
        updateProduct(item.product.id, {
          totalStockSold: updatedTotalStockSold,
          stock: updatedStock,
        });
        db.collection("users")
          .doc(user?.uid)
          .collection("products")
          .doc(item.product.id.toString())
          .update({
            totalStockSold: updatedTotalStockSold,
            stock: updatedStock,
          });
      });
      Toast.show("report deleted successfully", Toast.SHORT);
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting report:", error);
      Toast.show("Error deleting report", Toast.SHORT);
    }
  };

  const formatDateString = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const computeProfit = () => {
    let total = 0;
    item.productList.forEach(
      (product) =>
        (total +=
          (product.product.sellPrice - product.product.stockPrice) *
          (product.quantity as number))
    );
    return (
      total -
      (item.otherExpense as number) -
      ((item.catTreatDiscount as number) +
        (item.dogTreatDiscount as number) +
        (item.gateDiscount as number))
    );
  };
  const totalAmount = () => {
    let total = 0;
    item.productList.forEach(
      (items) => (total += items.product.sellPrice * (items.quantity as number))
    );
    total = total - (item.otherExpense as number);
    return total;
  };
  const computeChange = () => {
    return (item.customerPayment as number) - totalAmount();
  };

  const computeChangeForEdit = () => {
    return parseFloat(editCustomerPayment) - totalAmountForEdit();
  };
  const handleEditModalVisible = () => {
    setIsEditModalVisible(!isEditModalVisible);
    if (!isEditModalVisible) {
      setEditCustomerPayment(item.customerPayment.toString());
      setEditDate(itemDate);
      setEditDiscount(item.otherExpense.toString());
      setEditDogTreatDiscount(item.dogTreatDiscount.toString());
      setEditCatTreatDiscount(item.catTreatDiscount.toString());
      setEditGateDiscount(item.gateDiscount.toString());
      setEditProductList(item.productList);
    }

    const beforeProducts = products.map((before) => {
      const selectedProduct = item.productList.find(
        (beforeSelected) => beforeSelected.product.id === before.id
      );
      return selectedProduct
        ? {
            ...before,
            stock: before.stock + (selectedProduct.quantity as number),
          }
        : before;
    });
    setDraftProductList(beforeProducts);
  };
  const handleComponentVisibility = () => {
    setComponentVisible(!componentVisible);
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      const currentDate = selectedDate;
      setEditDate(currentDate);
      if (Platform.OS === "android") {
        showDatepicker();
        setEditDate(currentDate);
      }
    } else {
      showDatepicker();
    }
  };

  const confirmIosDate = () => {
    setEditDate(editDate);
    showDatepicker();
  };

  const showDatepicker = () => {
    setShow(!show);
  };

  const handleTotalAmount = (
    summary: { product: Product; quantity: number }[]
  ) => {
    let total = 0;
    summary.forEach(
      (item) => (total += item.product.sellPrice * item.quantity)
    );
    return total;
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

  const filteredData = useMemo(() => {
    const filteredItems = draftProductList.filter((item) =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sortedFilteredItems = filteredItems.sort((a, b) =>
      a.productName.toString().localeCompare(b.productName.toString())
    );

    return sortedFilteredItems;
  }, [draftProductList, searchQuery]);

  const handleEditProductsBoughtModal = () => {
    setIstEditProductsBoughtVisible(!IsEditProductsBoughtVisible);
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
          setEditSelectedCustomer(newCustomer);
        } else {
          Toast.show("Customer name should not be empty", Toast.SHORT);
        }
        Toast.show("Added successfully", Toast.SHORT);
      }
      setAddComponentVisible(false);
      setComponentVisible(false);
      setButtonVisible(true);
    } catch (error) {
      console.log("Error adding data: ", error as Error);
    }
  };
  const filteredDataForCustomer = () => {
    const filtered = customers.filter((item) =>
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.sort((a, b) =>
      a.customerName.localeCompare(b.customerName.toString())
    );
  };

  const totalAmountForEdit = () => {
    let total = 0;
    editProductsList.forEach(
      (items) => (total += items.product.sellPrice * (items.quantity as number))
    );
    total = total - parseFloat(editDiscount);
    return total;
  };

  const closeProductListModal = () => {
    setIstEditProductsBoughtVisible(false);

    const mappedSelectedProducts = editProductsList.map((item) => ({
      product: item.product,
      quantity: item.quantity as number,
    }));

    const getProduct: { product: Product; quantity: number }[] =
      mappedSelectedProducts
        .map((item) => {
          const fetched = products.find(
            (product) => product.id === item.product.id
          );
          return fetched ? { product: fetched, quantity: item.quantity } : null;
        })
        .filter((item) => item !== null) as {
        product: Product;
        quantity: number;
      }[];

    setSelectedProducts(getProduct);
    setEditProductList(item.productList);

    const beforeProducts = products.map((before) => {
      const selectedProduct = item.productList.find(
        (itemSelected) => itemSelected.product.id === before.id
      );
      return selectedProduct
        ? {
            ...before,
            stock: before.stock + (selectedProduct.quantity as number),
          }
        : before;
    });
    setDraftProductList(beforeProducts);
  };

  const confirmEditCustomerReport = async () => {
    const updatedReport = {
      customer: editSelectedCustomer,
      productList: editProductsList,
      date: editDate,
      otherExpense: parseFloat(editDiscount),
      catTreatDiscount: parseFloat(editCatTreatDiscount),
      dogTreatDiscount: parseFloat(editDogTreatDiscount),
      gateDiscount: parseFloat(editGateDiscount),
      customerPayment: parseFloat(editCustomerPayment),
    };

    updateSalesReport(item.id, updatedReport);

    editProductsList.forEach((editItem) => {
      const draftProduct = draftProductList.find(
        (draftItem) => draftItem.id === editItem.product.id
      );

      const currentItem = item.productList.find(
        (curr) => curr.product.id === editItem.product.id
      );

      if (currentItem && currentItem.quantity < editItem.quantity) {
        const subtractStock =
          (editItem.quantity as number) - (currentItem.quantity as number);
        console.log("subtractStock", subtractStock);
      } else if (currentItem && currentItem.quantity > editItem.quantity) {
        const subtractStock =
          (currentItem.quantity as number) - (editItem.quantity as number);
        console.log("subtractStock", subtractStock);
      }
      if (draftProduct)
        updateProduct(editItem.product.id, {
          stock: draftProduct?.stock - (editItem.quantity as number),
        });
    });

    if (user) {
      const docRefSales = db
        .collection("users")
        .doc(user.uid)
        .collection("sales")
        .doc(item.id.toString());
      await docRefSales.update(updatedReport);
      setItem({ id: item.id, ...updatedReport });
      updateSalesReport(item.id, {
        customer: editSelectedCustomer,
        productList: editProductsList,
        date: editDate,
        otherExpense: parseFloat(editDiscount),
        catTreatDiscount: parseFloat(editCatTreatDiscount),
        dogTreatDiscount: parseFloat(editDogTreatDiscount),
        gateDiscount: parseFloat(editGateDiscount),
        customerPayment: parseFloat(editCustomerPayment),
      });

      const docRefProduct = db
        .collection("users")
        .doc(user.uid)
        .collection("products");
      editProductsList.forEach((item) => {
        const draftProduct = draftProductList.find(
          (draftItem) => draftItem.id === item.product.id
        );
        if (draftProduct)
          docRefProduct.doc(item.product.id.toString()).update({
            stock: draftProduct?.stock - (item.quantity as number),
            //totalStockSold: total !== 0 ? total : item.product.totalStockSold, come back later
          });
      });
    }
    //here
    setIsEditCustomerReportConfirmationVisible(false);
    handleEditModalVisible();
  };

  const adjustQuantityFromInput = (productId: string, text: string) => {
    setSelectedProducts((prev) => {
      const existingSelectedProduct = draftProductList.find(
        (item) => item.id === productId
      );

      if (existingSelectedProduct) {
        const newQuantity = parseFloat(text) || 0;
        const minQuantity = 0.5;
        const maxQuantity = existingSelectedProduct.stock;

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
        const selectedProduct = draftProductList.find(
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

  const handleSelectItem = (productId: String) => {
    const selectedProduct = draftProductList.find(
      (item) => item.id === productId
    );
    const existingSelectedProduct = selectedProducts.find(
      (item) => item.product.id === productId
    );

    if (!selected.includes(productId)) {
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
        const updatedProduct = editProductsList.find(
          (product) => product.product.id === productId
        );

        if (updatedProduct) {
          // If the product object exists, update its quantity
          setEditProductList((prev) =>
            prev.map((product) =>
              product.product.id === productId
                ? {
                    ...product,
                    product: {
                      ...product.product,
                      quantity: (updatedProduct.quantity as number) + 1,
                    },
                  }
                : product
            )
          );
        } else {
          // If the product object doesn't exist, add it to the editProductList array
          if (selectedProduct)
            setEditProductList((prev) => [
              ...prev,
              { product: selectedProduct, quantity: 0.5 },
            ]);
        }
      } else {
        Toast.show(`${selectedProduct.productName} is sold out`, Toast.SHORT);
      }
    } else {
      Toast.show(
        `${selectedProduct?.productName} is already bought by ${item.customer?.customerName}`,
        Toast.SHORT
      );
    }
  };

  useEffect(() => {
    const mappedSelectedProducts = editProductsList.map((item) => ({
      product: item.product,
      quantity: item.quantity as number,
    }));

    const getProduct: { product: Product; quantity: number }[] =
      mappedSelectedProducts
        .map((item) => {
          const fetched = products.find(
            (product) => product.id === item.product.id
          );
          return fetched ? { product: fetched, quantity: item.quantity } : null;
        })
        .filter((item) => item !== null) as {
        product: Product;
        quantity: number;
      }[];

    setSelectedProducts(getProduct);
    setSelected(mappedSelectedProducts.map((item) => item.product.id));
    setEditTotalProfit(handleTotalProfit(selectedProducts));
    setEditTotalAmount(handleTotalAmount(selectedProducts));
  }, [isEditModalVisible, editProductsList]);

  useEffect(() => {
    setEditTotalProfit(handleTotalProfit(selectedProducts));
    setEditTotalAmount(handleTotalAmount(selectedProducts));
  }, [quantityInput, IsEditProductsBoughtVisible, selected, selectedProducts]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f7f7f7", position: "relative" }}
    >
      <View
        style={{
          marginHorizontal: 10,
          flex: 1,
          marginVertical: 5,
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          {`${
            userName?.charAt(userName.length - 1).toLocaleLowerCase() === "s"
              ? `${userName}'`
              : `${userName}'s`
          } Customer Report`}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Customer name: {item.customer?.customerName}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Date bought:{" "}
          {formatDateString(item.date instanceof Date ? item.date : itemDate)}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Total Amount: ₱{totalAmount().toFixed(2)}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Customer payment: ₱{item.customerPayment.toFixed(2)}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Given Discount: ₱{item.otherExpense.toFixed(2)}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Given Dog Treat Discount: ₱{item.dogTreatDiscount.toFixed(2)}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Given Cat Treat Discount: ₱{item.catTreatDiscount.toFixed(2)}
        </Text>
        <Text style={{ fontSize: 18 }}>
          Given Gate Discount: ₱{item.gateDiscount.toFixed(2)}
        </Text>
        <Text
          style={{ fontSize: 18, color: computeChange() < 0 ? "red" : "black" }}
        >
          Customer change w/discount: ₱{computeChange().toFixed(2)}
        </Text>

        <Text style={{ fontSize: 18 }}>
          Total Profit: ₱{computeProfit().toFixed(2)}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
          Products Bought:
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", flex: 3 }}>
            Product name
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "bold", flex: 1 }}>
            Price
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "bold", flex: 1 }}>
            Quantity
          </Text>
        </View>
        <FlatList
          onScroll={() => setFloatingButtonOpacity(0.1)}
          onScrollEndDrag={() => setFloatingButtonOpacity(1)}
          data={item.productList}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                borderBottomWidth: 2,
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 16, flex: 3 }}>
                {item.product.productName}
              </Text>
              <Text style={{ fontSize: 16, flex: 1, color: "blue" }}>
                ₱{item.product.sellPrice}
              </Text>
              <Text style={{ fontSize: 16, flex: 1, textAlign: "center" }}>
                {item.quantity.toString()}
              </Text>
            </View>
          )}
        />
      </View>
      <View
        style={{
          position: "absolute",
          right: wp("5%"),
          bottom: hp("4%"),
          opacity: floatingButtonOpacity,
        }}
      >
        <AnimatedFloatingButton
          setIsVisible={setIsVisible}
          handleEditModalVisible={handleEditModalVisible}
        />
      </View>
      <Dialog.Container visible={isVisible}>
        <Dialog.Title>Delete Report</Dialog.Title>
        <Dialog.Description>
          This will affect the reports, are you sure you want to delete?
        </Dialog.Description>
        <Dialog.Button label={"Cancel"} onPress={() => setIsVisible(false)} />
        <Dialog.Button label={"Confirm"} onPress={() => deleteData(item.id)} />
      </Dialog.Container>

      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleEditModalVisible}
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
          }}
        >
          <Text
            style={{
              fontSize: hp("3%"),
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Edit Customer Report
          </Text>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: hp("2%"),
              }}
            >
              <Text style={{ fontSize: hp("2.3%") }}>Customer: </Text>
              <Button
                title={
                  editSelectedCustomer
                    ? editSelectedCustomer?.customerName.toString()
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
                marginTop: hp("2%"),
              }}
            >
              <Text style={{ fontSize: hp("2.3%") }}>Date Bought: </Text>
              <Button
                title={`${formatDateString(editDate)}`}
                onPress={() => setShow(true)}
                containerStyle={{ borderRadius: wp("2%"), flex: 1 }}
                titleStyle={{ fontSize: hp("1.7%") }}
                buttonStyle={{ backgroundColor: "#af71bd" }}
              />
              {show && (
                <DateTimePicker
                  mode="date"
                  display="calendar"
                  value={itemDate}
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
            <EditTextComponent
              inputLabel="Customer Payment: "
              placeholder="Payment"
              value={editCustomerPayment}
              setValue={setEditCustomerPayment}
              keyboardType="numeric"
            />
            <EditTextComponent
              inputLabel="Discount: "
              placeholder="Discount"
              value={editDiscount}
              setValue={setEditDiscount}
              keyboardType="numeric"
            />
            <EditTextComponent
              inputLabel="Dog Treat Discount: "
              placeholder="Dog Treat Discount"
              value={editDogTreatDiscount}
              setValue={setEditDogTreatDiscount}
              keyboardType="numeric"
            />
            <EditTextComponent
              inputLabel="Cat Treat Discount: "
              placeholder="Dog Treat Discount"
              value={editCatTreatDiscount}
              setValue={setEditCatTreatDiscount}
              keyboardType="numeric"
            />
            <EditTextComponent
              inputLabel="Edit Gate Discount: "
              placeholder="Gate Discount"
              value={editGateDiscount}
              setValue={setEditGateDiscount}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={handleEditProductsBoughtModal}>
              <Text
                style={{
                  textAlign: "center",
                  marginTop: hp("2%"),
                  fontWeight: "bold",
                  fontSize: hp("2.3%"),
                  color: "#0000FF",
                }}
              >
                Click to edit products bought
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ flex: 3, fontWeight: "bold" }}>Product Name</Text>
              <Text style={{ flex: 1, fontWeight: "bold" }}>Price</Text>
              <Text style={{ flex: 1, fontWeight: "bold" }}>Quantity</Text>
            </View>
            <FlatList
              data={editProductsList}
              renderItem={({ item }) => (
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ flex: 3 }}>{item.product.productName}</Text>
                  <Text style={{ flex: 1, color: "blue" }}>
                    ₱{item.product.sellPrice}
                  </Text>
                  <Text style={{ flex: 1, textAlign: "center" }}>
                    {item.quantity.toString()}
                  </Text>
                </View>
              )}
            />
            <Text style={{ marginBottom: hp("1%") }}>
              Change: ₱
              {editCustomerPayment === ""
                ? 0
                : computeChangeForEdit().toFixed(2)}
            </Text>
            <Text style={{ marginBottom: hp("2%") }}>
              Total Amount:{" ₱"}
              {totalAmountForEdit().toFixed(2)}
            </Text>

            <Button
              title={"Save"}
              containerStyle={{
                borderRadius: wp("2%"),
                marginHorizontal: wp("20%"),
              }}
              titleStyle={{ fontSize: hp("2%") }}
              buttonStyle={{ backgroundColor: "#af71bd" }}
              onPress={() => setIsEditCustomerReportConfirmationVisible(true)}
            />
          </View>
        </View>
        <Dialog.Container visible={isEditCustomerReportConfirmationVisible}>
          <Dialog.Title>Save changes</Dialog.Title>
          <Dialog.Description>
            If you changed the products bought, also check for the customer
            payment field, are you sure you want to make these changes?
          </Dialog.Description>
          <Dialog.Button
            label={"Cancel"}
            onPress={() => setIsEditCustomerReportConfirmationVisible(false)}
          />
          <Dialog.Button
            label={"Confirm"}
            onPress={() => confirmEditCustomerReport()}
          />
        </Dialog.Container>
      </Modal>

      <Modal
        visible={IsEditProductsBoughtVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          closeProductListModal();
          editProductsList.forEach((item) =>
            setQuantityInput((prev) => ({
              ...prev,
              [item.product.id.toString()]: item.quantity.toString(),
            }))
          );
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#f7f7f7",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <KeyboardAwareScrollView>
              <SearchBar
                placeholder={"Search Product"}
                containerStyle={{
                  backgroundColor: "#f7f7f7",
                  borderColor: "#f7f7f7",
                  flex: 1,
                }}
                inputContainerStyle={{
                  backgroundColor: "#f7f2f7",
                }}
                round
                autoCapitalize="none"
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
              />
            </KeyboardAwareScrollView>
            <TouchableOpacity
              style={{
                padding: 10,
                marginTop: 5,
                marginRight: 5,
                backgroundColor: "#f7f2f7",
                borderRadius: 10,
              }}
              onPress={() => setIsDialogProductConfirmationVisible(true)}
            >
              <Entypo name="check" size={24} color="#af71bd" />
            </TouchableOpacity>
          </View>

          <FlatList
            style={{ flex: 1 }}
            data={filteredData}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  handleSelectItem(item.id);
                }}
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
                  <Text style={{ flex: 0.8 }}>
                    Stock: {item.stock.toString()}
                  </Text>
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
                <Text style={[styles.summaryLabel, { flex: 3 }]}>
                  Product name
                </Text>

                <Text
                  style={[
                    styles.summaryLabel,
                    { flex: 1, textAlign: "center" },
                  ]}
                >
                  Qty
                </Text>
              </View>
              <ScrollView>
                <FlatList
                  data={selectedProducts}
                  renderItem={({ item }) => (
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
                              (element) =>
                                element.product.id !== item.product.id
                            )
                          );
                          setSelected(
                            selected.filter(
                              (element) => element !== item.product.id
                            )
                          );
                          setEditProductList(
                            editProductsList.filter(
                              (element) =>
                                element.product.id !== item.product.id
                            )
                          );
                        }}
                      >
                        <Text>{item.product.productName}</Text>
                      </TouchableOpacity>

                      <TextInput
                        style={{
                          flex: 1,
                          textAlign: "center",
                        }}
                        placeholder={`${item.quantity}`}
                        onChangeText={(text) =>
                          setQuantityInput((prev) => ({
                            ...prev,
                            [item.product.id.toString()]: text,
                          }))
                        }
                        value={
                          quantityInput[item.product.id.toString()] !==
                          undefined
                            ? quantityInput[item.product.id.toString()]
                            : item.quantity.toString()
                        }
                        onSubmitEditing={() => {
                          const beforeStock = draftProductList.find(
                            (draft) => draft.id === item.product.id
                          );
                          const submittedValue =
                            quantityInput[item.product.id.toString()] || "0";
                          const clampedValue = Math.min(
                            Math.max(parseFloat(submittedValue), 0.5),
                            beforeStock?.stock!
                          );
                          setQuantityInput((prev) => ({
                            ...prev,
                            [item.product.id.toString()]:
                              clampedValue.toString(),
                          }));
                          adjustQuantityFromInput(
                            item.product.id.toString(),
                            clampedValue.toString()
                          );
                          setEditTotalProfit(
                            handleTotalProfit(selectedProducts)
                          );
                          setEditTotalAmount(
                            handleTotalAmount(selectedProducts)
                          );
                        }}
                        onBlur={() => {
                          const beforeStock = draftProductList.find(
                            (draft) => draft.id === item.product.id
                          );
                          const submittedValue =
                            quantityInput[item.product.id.toString()] || "0";
                          const clampedValue = Math.min(
                            Math.max(parseFloat(submittedValue), 0.5),
                            beforeStock?.stock!
                          );
                          setQuantityInput((prev) => ({
                            ...prev,
                            [item.product.id.toString()]:
                              clampedValue.toString(),
                          }));
                          adjustQuantityFromInput(
                            item.product.id.toString(),
                            clampedValue.toString()
                          );
                          setEditTotalProfit(
                            handleTotalProfit(selectedProducts)
                          );
                          setEditTotalAmount(
                            handleTotalAmount(selectedProducts)
                          );
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                />
              </ScrollView>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ marginLeft: wp("1%") }}>
                  <Text>Total: ₱{editTotalAmount.toFixed(2)}</Text>
                  <Text>Total profit: ₱{editTotalProfit.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <Dialog.Container visible={isDialogProductConfirmationVisible}>
          <Dialog.Title>Save Changes?</Dialog.Title>
          <Dialog.Description>
            Make sure you pressed the enter key on your keyboard to make changes
            to the quantity and that the value you change was correct.
          </Dialog.Description>
          <Dialog.Button
            label={"Cancel"}
            onPress={() => setIsDialogProductConfirmationVisible(false)}
          />
          <Dialog.Button
            label={"Confirm"}
            onPress={() => {
              setIsDialogProductConfirmationVisible(false);
              setEditProductList((prev) =>
                prev.map((item) => ({
                  ...item,
                  quantity:
                    selectedProducts.find(
                      (product) => product.product.id === item.product.id
                    )?.quantity || 0,
                }))
              );
              selectedProducts.forEach((item) =>
                setQuantityInput((prev) => ({
                  ...prev,
                  [item.product.id.toString()]: item.quantity.toString(),
                }))
              );

              setIstEditProductsBoughtVisible(false);
            }}
          />
        </Dialog.Container>
      </Modal>
      <SelectCustomerModalComponent
        addComponentVisible={addComponentVisible}
        componentVisible={componentVisible}
        addDataCustomer={addDataCustomer}
        customerInfo={customerInfo}
        customerName={customerName}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredData={filteredDataForCustomer}
        handleComponentVisibility={handleComponentVisibility}
        setAddComponentVisible={setAddComponentVisible}
        setButtonVisible={setButtonVisible}
        setCustomerInfo={setCustomerInfo}
        setCustomerName={setCustomerName}
        setSelected={setEditSelectedCustomer}
      />
    </SafeAreaView>
  );
};

export default SummaryCustomerReportScreen;

const styles = StyleSheet.create({
  touchableStyle: {
    backgroundColor: "#af71bd",
    borderRadius: wp("2%"),
    marginRight: wp("2%"),
  },
  summaryLabel: {
    fontWeight: "500",
    fontSize: hp("1.8%"),
    marginBottom: 10,
  },
});
