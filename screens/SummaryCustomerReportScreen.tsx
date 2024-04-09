import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Modal,
  Platform,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Customer, Product, ReportRootStackParamList } from "../type";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../firebaseconfig";
import Dialog from "react-native-dialog";
import { useSalesReportContext } from "../context/salesReportContext";
import Toast from "react-native-simple-toast";
import { useProductContext } from "../context/productContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AnimatedFloatingButton from "../components/AnimatedFloatingButton";
import EditTextComponent from "../components/EditTextComponent";
import { Button, SearchBar } from "@rneui/base";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useCustomerContext } from "../context/customerContext";
import { Entypo, Ionicons } from "@expo/vector-icons";
import SelectCustomerModalComponent from "../components/SelectCustomerModalComponent";

type SummaryCustomerReportSreenProp = {
  route: RouteProp<ReportRootStackParamList, "SummaryCustomerReportScreen">;
};
const SummaryCustomerReportScreen = ({
  route,
}: SummaryCustomerReportSreenProp) => {
  const [item, setItem] = useState(route.params);
  const [itemDate, setItemDate] = useState(
    typeof item.date === "string" ? new Date(item.date) : item.date
  );
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
  const [isEditing, setIsEditing] = useState(false);
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
  const [draftProductList, setDraftProductList] = useState(products);
  const [firstInput, setFirstInput] = useState<
    { productId: String; isFirstInput: boolean }[]
  >([]);
  const [haveSave, setHaveSave] = useState(false);
  const [latestSaved, setLatestSaved] = useState<
    {
      product: Product;
      quantity: number;
    }[]
  >();

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
    }
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

  const handleSelectItem = (productId: String) => {
    const selectedProduct = draftProductList.find(
      (item) => item.id === productId
    );
    const existingSelectedProduct = selectedProducts.find(
      (item) => item.product.id === productId
    );
    if (selected.includes(productId)) {
      setSelected(selected.filter((item) => item !== productId));
      setSelectedProducts((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
      setFirstInput((prev) =>
        prev.filter((item) => item.productId !== productId)
      );
      setEditProductList((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
      returnStockToEditStock(
        selectedProducts.find((item) => item.product.id === productId)!
      );
    } else {
      if (selectedProduct?.stock !== 0) {
        setFirstInput((prev) => [
          ...prev,
          { productId: productId, isFirstInput: true },
        ]);
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
          setDraftProductList((prev) => {
            const updatedItems = prev.map((item) => {
              if (item.id === selectedProduct?.id) {
                return {
                  ...item,
                  stock: item.stock - 0.5,
                };
              }
              return item;
            });
            return updatedItems;
          });
        }
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

    setQuantityInput((prev) => ({
      ...prev,
      [productId]:
        selectedProducts
          .find((item) => item.product.id === productId)
          ?.quantity.toString() || "",
    }));

    setFirstInput((prev) =>
      prev.map((inputItem) => {
        if (inputItem.productId === productId) {
          return {
            ...inputItem,
            isFirstInput: false,
          };
        }
        return inputItem;
      })
    );
  };

  useEffect(() => {
    selectedProducts.forEach((item) => {
      subtractStockToEditStock(item.product.id);
    });
  }, [selectedProducts]);

  console.log("firstInputArray", firstInput);
  console.log("selectedItemsArray", selectedProducts);
  console.log("editProductListArray", editProductsList);

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

  const handleEditProductsBoughtModal = () => {
    setIstEditProductsBoughtVisible(!IsEditProductsBoughtVisible);
    const mappedSelectedProducts = editProductsList.map((item) => ({
      product: item.product,
      quantity: item.quantity as number,
    }));

    setSelectedProducts(mappedSelectedProducts);
    setSelected(mappedSelectedProducts.map((item) => item.product.id));
    setFirstInput(
      mappedSelectedProducts.map((selectedItem) => ({
        productId: selectedItem.product.id,
        isFirstInput: true,
      }))
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
    if (!haveSave) setEditProductList(item.productList);
    else setEditProductList(latestSaved!);
  };

  console.log("havesave", haveSave);
  console.log("latestSave", latestSaved);
  const returnStockToEditStock = (element: {
    product: Product;
    quantity: number;
  }) => {
    setDraftProductList((prevList) => {
      return prevList.map((item) => {
        if (item.id === element.product.id) {
          return {
            ...item,
            stock: item.stock + element.quantity,
          };
        }
        return item;
      });
    });
  };

  const subtractStockToEditStock = (productId: String) => {
    const productItem = editProductsList.find(
      (item) => item.product.id === productId
    );
    const selectedProduct = selectedProducts.find(
      (item) => item.product.id === productId
    );
    if (productItem) {
      const productStock = productItem.product.stock;
      const inputCheck = firstInput.find(
        (item) => item.productId === productId
      );

      if (inputCheck && !inputCheck.isFirstInput) {
        setDraftProductList((prev) => {
          return prev.map((item) => {
            if (item.id === productId) {
              return {
                ...item,
                stock: productStock - (selectedProduct?.quantity as number),
              };
            }

            return item;
          });
        });
      }
    }
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

    editProductsList.forEach((item) => {
      updateProduct(item.product.id, {
        stock: item.product.stock - (item.quantity as number),
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

      const docRefProduct = db
        .collection("users")
        .doc(user.uid)
        .collection("products");
      editProductsList.forEach((item) => {
        docRefProduct.doc(item.product.id.toString()).update(item.product);
      });
    }

    setIsEditCustomerReportConfirmationVisible(false);
    handleEditModalVisible();
  };

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
        <Text style={{ fontSize: 18 }}>
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
            Are you sure you want to make these changes?
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
        onRequestClose={closeProductListModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#f7f7f7",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                  subtractStockToEditStock(item.id);
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
                  <ScrollView style={{ marginVertical: 5 }}>
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
                          setQuantityInput((prevQuantityInput) => ({
                            ...prevQuantityInput,
                            [item.product.id.toString()]: "0.5",
                          }));
                          //come
                          returnStockToEditStock(item);
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
                        onFocus={() => {
                          setIsEditing(true);
                          setFirstInput((prev) =>
                            prev.map((inputItem) => {
                              if (inputItem.productId === item.product.id) {
                                return {
                                  ...inputItem,
                                  isFirstInput: false,
                                };
                              }
                              return inputItem;
                            })
                          );
                        }}
                        onBlur={() => {
                          setIsEditing(false);
                          subtractStockToEditStock(item.product.id);
                        }}
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
                            [item.product.id.toString()]:
                              clampedValue.toString(),
                          }));
                          adjustQuantityFromInput(
                            item.product.id.toString(),
                            clampedValue.toString()
                          );
                          subtractStockToEditStock(item.product.id);
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
                            onPress={() => {
                              handleQuantity(
                                item.product.id.toString(),
                                "reduce"
                              );
                            }}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.touchableStyle}
                          onPress={() => {
                            handleQuantity(item.product.id.toString(), "add");
                          }}
                        >
                          <Ionicons name="add" size={24} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </ScrollView>
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
                    Total profit: ₱
                    {handleTotalProfit(selectedProducts).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
        <Dialog.Container visible={isDialogProductConfirmationVisible}>
          <Dialog.Title>Save Changes?</Dialog.Title>
          <Dialog.Description>Confirm changes?</Dialog.Description>
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
              setHaveSave(true);
              setLatestSaved(selectedProducts);
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
