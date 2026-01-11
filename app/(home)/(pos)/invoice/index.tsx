import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Input from "@/components/inputs/Input";
import { strongPrimary, primary, secondary } from "@/theme/backgroundTheme";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import InvoiceForm from "@/types/InvoiceForm";
import Customer from "@/types/Customer";
import DatePicker from "react-native-date-picker";
import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
import ModalTemplate from "@/components/modals/ModalTemplate";
import SearchBar from "@/components/searchbars/SearchBar";
import { useCustomerContext } from "@/contexts/CustomerContext";
import { api } from "@/config/axios-api";
import { useSelectedProductContext } from "@/contexts/SelectedProductContext";
import { isAxiosError } from "axios";
import calculateTotalProfit from "@/methods/invoice/calculateTotalProfit";
import calculateTotalSellPrice from "@/methods/invoice/calculateTotalSellPrice";
import { router } from "expo-router";
import { useInvoiceFormContext } from "@/contexts/InvoiceFormContext";
import { useSelectedProductsArray } from "@/hooks/useSelectedProductsArray";
import useCustomersArray from "@/hooks/useCustomersArray";
import searchCustomerByName from "@/methods/search/searchCustomerByName";
import { useUserContext } from "@/contexts/UserContext";
import Toast from "react-native-toast-message";
import useBluetoothPrinter from "@/hooks/useBluetoothPrinter";

// UI
const InvoiceScreen = () => {
    // Invoice Input
    const { invoiceForm, setInvoiceForm } = useInvoiceFormContext();

    const handleInvoiceChange = <K extends keyof InvoiceForm>(
        key: K,
        value: string | Date | Customer | null
    ) => {
        setInvoiceForm((prev) => ({
            ...prev,
            [key]: value as InvoiceForm[K],
        }));
    };

    const [isInvoiceSubmitting, setIsInvoiceSubmitting] = useState(false);

    // Date Picker Visibility
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    // Customer Picker
    const [isCustomerPickerVisible, setCustomerPickerVisibility] =
        useState(false);
    const [customerSearchInput, setCustomerSearchInput] = useState("");
    const { customers } = useCustomerContext();
    const { customerArray } = useCustomersArray(customers);
    const filteredCustomer = searchCustomerByName(
        customerArray,
        customerSearchInput
    );

    // selectedProduct
    const { selectedProducts, setSelectedProductList } =
        useSelectedProductContext();

    const { selectedProductArray } = useSelectedProductsArray(selectedProducts);

    // send to pending order
    const [isPendingOrder, setIspPendingOrder] = useState(false);
    // pendingOrderInformation Input
    const [pendingOrderInformation, setPendingOrderInformation] = useState("");
    const orderInformationRef = useRef<TextInput>(null);

    const scrollViewRef = useRef<ScrollView>(null);

    const handleScrollToBottom = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd();
        }
    };

    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            "keyboardDidShow",
            () => {
                setKeyboardVisible(true);
            }
        );

        const keyboardDidHideListener = Keyboard.addListener(
            "keyboardDidHide",
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    // customer list modal
    const renderCustomerList = useCallback(
        ({ item }: { item: Customer }) => {
            return (
                <TouchableOpacity
                    style={{
                        marginVertical: hp(0.5),
                        backgroundColor: "rgba(255,255,255,0.85)",
                        borderColor: "rgba(0,0,0,0.6)",
                        borderWidth: 1,
                        borderRadius: wp(2),
                        padding: wp(1),
                    }}
                    activeOpacity={0.7}
                    onPress={() => {
                        setInvoiceForm((prev) => ({
                            ...prev,
                            customer: item,
                        }));
                        setCustomerPickerVisibility(false);
                    }}
                >
                    <Text
                        style={{
                            fontFamily: "Gantari-SemiBold",
                            fontSize: wp(4),
                        }}
                    >
                        {item.customerName}
                    </Text>
                    <Text
                        style={{
                            fontFamily: "Gantari-Regular",
                            fontSize: wp(3.5),
                            color: "rgba(0,0,0,0.4)",
                        }}
                        numberOfLines={1}
                    >
                        {item.customerInfo}
                    </Text>
                </TouchableOpacity>
            );
        },
        [setInvoiceForm]
    );

    // on form submit
    const addTransaction = async () => {
        try {
            setIsInvoiceSubmitting(true);
            const productTransactionBody = selectedProductArray.map(
                (selectedProduct) => ({
                    productId: selectedProduct.id,
                    quantity: selectedProduct.quantity,
                })
            );

            const response = await api.post("/transactions/add", {
                customerId: invoiceForm.customer?.id,
                items: productTransactionBody,
                onlinePayment: parseFloat(invoiceForm.onlinePayment || "0"),
                cashPayment: parseFloat(invoiceForm.cashPayment || "0"),
                date: invoiceForm.date,
                deliveryFee: parseFloat(invoiceForm.deliveryFee || "0"),
                discount: parseFloat(invoiceForm.discount || "0"),
                freebies: parseFloat(invoiceForm.freebies || "0"),
                pending: isPendingOrder,
                orderInformation: pendingOrderInformation,
            });

            setSelectedProductList(new Map());
            setInvoiceForm({
                cashPayment: "",
                onlinePayment: "",
                customer: null,
                date: new Date(),
                discount: "",
                freebies: "",
                deliveryFee: "",
            });
            setIspPendingOrder(false);
            setPendingOrderInformation("");
            Toast.show({ type: "success", text1: `${response?.data.message}` });
        } catch (error) {
            if (isAxiosError(error)) {
                Toast.show({
                    type: "error",
                    text1: `${error.response?.data.error}`,
                });
            }
        } finally {
            setIsInvoiceSubmitting(false);
        }
    };

    const { role } = useUserContext();
    const { printReceipt, pairSavedPrinter } =
        useBluetoothPrinter();

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: primary,
                paddingVertical: hp(2),
                paddingHorizontal: wp(2),
            }}
        >
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
                <ScrollView
                    contentContainerStyle={{ gap: hp(2) }}
                    ref={scrollViewRef}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            gap: wp(2),
                        }}
                    >
                        <Input
                            placeholder="Cash Payment"
                            value={invoiceForm.cashPayment}
                            onChangeText={(text) =>
                                handleInvoiceChange("cashPayment", text)
                            }
                            icon={{
                                name: "cash",
                                family: "MaterialCommunityIcons",
                                color: "rgba(0,0,0,0.4)",
                            }}
                            row
                            inputType="numeric"
                        />
                        <Input
                            placeholder="Online Payment"
                            value={invoiceForm.onlinePayment}
                            onChangeText={(text) =>
                                handleInvoiceChange("onlinePayment", text)
                            }
                            icon={{
                                name: "online-prediction",
                                family: "MaterialIcons",
                                color: "rgba(0,0,0,0.4)",
                            }}
                            row
                            inputType="numeric"
                        />
                    </View>
                    <Input
                        placeholder="Enter Delivery Fee"
                        value={invoiceForm.deliveryFee}
                        onChangeText={(text) =>
                            handleInvoiceChange("deliveryFee", text)
                        }
                        icon={{
                            name: "delivery-dining",
                            family: "MaterialIcons",
                            color: "rgba(0,0,0,0.4)",
                        }}
                        inputType="numeric"
                    />
                    <TouchableOpacity
                        style={{
                            borderWidth: wp(0.3),
                            borderColor: strongPrimary,
                            borderRadius: wp(2),
                            padding: wp(2),
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                            gap: wp(1),
                        }}
                        activeOpacity={0.7}
                        onPress={() => setCustomerPickerVisibility(true)}
                    >
                        <Text
                            style={[
                                styles.buttonLabel,
                                {
                                    color: invoiceForm.customer?.customerName
                                        ? "black"
                                        : "rgba(0,0,0,0.5)",
                                },
                            ]}
                        >
                            {invoiceForm.customer
                                ? invoiceForm.customer.customerName
                                : "Select Customer"}
                        </Text>
                        <FontAwesome6
                            name="person"
                            size={wp(6)}
                            color="rgba(0,0,0,0.4)"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setDatePickerVisibility(true)}
                        style={{
                            borderWidth: wp(0.3),
                            borderColor: strongPrimary,
                            borderRadius: wp(2),
                            padding: wp(2),
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                            gap: wp(1),
                        }}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.buttonLabel,
                                {
                                    color: invoiceForm.date
                                        ? "black"
                                        : "rgba(0,0,0,0.5)",
                                },
                            ]}
                        >
                            {invoiceForm.date
                                ? invoiceForm.date.toLocaleString("en-PH", {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                  })
                                : "Set Date"}
                        </Text>
                        <AntDesign
                            name="calendar"
                            color={"rgba(0,0,0,0.4)"}
                            size={wp(6)}
                        />
                    </TouchableOpacity>
                    <DatePicker
                        modal
                        open={isDatePickerVisible}
                        date={invoiceForm.date ?? new Date()}
                        mode="datetime" // 👈 supports both date & time
                        onConfirm={(selectedDate) => {
                            setDatePickerVisibility(false);
                            setInvoiceForm((prev) => ({
                                ...prev,
                                date: new Date(selectedDate),
                            }));
                        }}
                        onCancel={() => setDatePickerVisibility(false)}
                    />
                    <View style={{ flexDirection: "row", gap: wp(2) }}>
                        <Input
                            placeholder="Discount"
                            value={invoiceForm.discount}
                            onChangeText={(text) =>
                                handleInvoiceChange("discount", text)
                            }
                            icon={{
                                name: "discount",
                                family: "MaterialIcons",
                                color: "rgba(0,0,0,0.4)",
                                size: wp(6),
                            }}
                            row
                            inputType="numeric"
                        />
                        <Input
                            placeholder="Freebies"
                            value={invoiceForm.freebies}
                            onChangeText={(text) =>
                                handleInvoiceChange("freebies", text)
                            }
                            icon={{
                                name: "gift",
                                family: "AntDesign",
                                color: "rgba(0,0,0,0.4)",
                            }}
                            row
                            inputType="numeric"
                        />
                    </View>
                    {role === "admin" && (
                        <>
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: "Gantari-Regular",
                                        fontSize: wp(4.5),
                                    }}
                                >
                                    Send to Pending Orders
                                </Text>
                                <Switch
                                    value={isPendingOrder}
                                    onValueChange={() =>
                                        setIspPendingOrder(!isPendingOrder)
                                    }
                                    trackColor={{
                                        true: strongPrimary,
                                        false: secondary,
                                    }}
                                    thumbColor={"#AFDDFF"}
                                />
                            </View>
                            {isPendingOrder && (
                                <View
                                    style={{
                                        height: keyboardVisible
                                            ? hp(30)
                                            : hp(15),
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily: "Gantari-Regular",
                                            fontSize: wp(4.5),
                                        }}
                                    >
                                        Information
                                    </Text>
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={{
                                            borderColor: strongPrimary,
                                            borderWidth: wp(0.3),
                                            borderRadius: wp(2),
                                            height: hp(15),
                                            padding: wp(1),
                                        }}
                                        onPress={() => {
                                            orderInformationRef.current?.focus();
                                            handleScrollToBottom();
                                        }}
                                    >
                                        <TextInput
                                            ref={orderInformationRef}
                                            multiline
                                            style={{
                                                fontFamily: "Gantari-Regular",
                                                fontSize: wp(4),
                                            }}
                                            value={pendingOrderInformation}
                                            onChangeText={(text) =>
                                                setPendingOrderInformation(text)
                                            }
                                            onFocus={() =>
                                                handleScrollToBottom()
                                            }
                                            onPointerEnter={() =>
                                                handleScrollToBottom()
                                            }
                                            onKeyPress={() =>
                                                handleScrollToBottom()
                                            }
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
            <View
                style={{
                    backgroundColor: primary,
                    borderRadius: 8,
                    overflow: "hidden",
                }}
            >
                {/* Shadow Top Border */}
                <View
                    style={{
                        height: 6,
                        backgroundColor: primary,

                        // iOS shadow
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 4,

                        // Android shadow
                        elevation: 2,
                        zIndex: 1,
                    }}
                />

                {/* Main Content */}
                <View style={{ padding: 16, gap: hp(1) }}>
                    <View style={styles.totalView}>
                        <Text style={styles.totalLabel}>Total Price:</Text>
                        <Text style={styles.totalValue}>
                            ₱
                            {calculateTotalSellPrice(
                                selectedProductArray,
                                invoiceForm.discount
                            ).toFixed(2)}
                        </Text>
                    </View>
                    {role === "admin" && (
                        <View style={styles.totalView}>
                            <Text style={styles.totalLabel}>Total Profit:</Text>
                            <Text style={styles.totalValue}>
                                ₱
                                {calculateTotalProfit(
                                    selectedProductArray,
                                    invoiceForm
                                ).toFixed(2)}
                            </Text>
                        </View>
                    )}

                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <TouchableOpacity
                            style={[
                                styles.invoiceButton,
                                { opacity: isInvoiceSubmitting ? 0.7 : 1 },
                            ]}
                            disabled={isInvoiceSubmitting}
                            onPress={() => {
                                setInvoiceForm({
                                    cashPayment: "",
                                    onlinePayment: "",
                                    customer: null,
                                    date: null,
                                    discount: "",
                                    freebies: "",
                                    deliveryFee: "",
                                });
                                setIspPendingOrder(false);
                                setPendingOrderInformation("");
                            }}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={{
                                    fontFamily: "Gantari-Regular",
                                    fontSize: wp(5),
                                }}
                            >
                                Clear
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.invoiceButton,
                                { opacity: isInvoiceSubmitting ? 0.7 : 1 },
                            ]}
                            disabled={isInvoiceSubmitting}
                            activeOpacity={0.7}
                            onPress={() =>
                                router.navigate("../invoice/preview")
                            }
                        >
                            <Text
                                style={{
                                    fontFamily: "Gantari-Regular",
                                    fontSize: wp(5),
                                }}
                            >
                                Preview
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                backgroundColor: strongPrimary,
                                borderRadius: wp(2),
                                alignItems: "center",
                                padding: wp(2),
                                width: wp(25),
                                opacity: isInvoiceSubmitting ? 0.7 : 1,
                            }}
                            onPress={async () => {
                                if (selectedProductArray.length === 0) {
                                    Toast.show({
                                        type: "error",
                                        text1: "No products selected",
                                    });
                                    return;
                                }
                                await addTransaction();

                                const { success } = await pairSavedPrinter();
                                if (success) {
                                    await printReceipt(
                                        invoiceForm,
                                        selectedProductArray
                                    );
                                }
                            }}
                            disabled={isInvoiceSubmitting}
                            activeOpacity={0.7}
                        >
                            {isInvoiceSubmitting ? (
                                <ActivityIndicator
                                    color={"white"}
                                    size={wp(6)}
                                />
                            ) : (
                                <Text
                                    style={{
                                        fontFamily: "Gantari-Regular",
                                        fontSize: wp(5),
                                        color: "white",
                                    }}
                                >
                                    Confirm
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <ModalTemplate
                visible={isCustomerPickerVisible}
                onClose={() => setCustomerPickerVisibility(false)}
                width={wp(90)}
                height={keyboardVisible ? hp(55) : hp(90)}
            >
                <SearchBar
                    value={customerSearchInput}
                    onChangeText={setCustomerSearchInput}
                    placeholder="Search Customer"
                />

                <FlatList
                    data={filteredCustomer}
                    renderItem={renderCustomerList}
                    initialNumToRender={10}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    removeClippedSubviews={true}
                    style={{ marginVertical: hp(1) }}
                    keyboardShouldPersistTaps="handled"
                />
            </ModalTemplate>
        </View>
    );
};

export default InvoiceScreen;

const styles = StyleSheet.create({
    buttonLabel: {
        fontFamily: "Gantari-Regular",
        fontSize: wp(4.5),
    },
    totalView: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    totalValue: {
        fontFamily: "Gantari-Bold",
        fontSize: wp(5),
        color: "black",
    },
    totalLabel: {
        fontSize: wp(5),
        fontFamily: "Gantari-Regular",
    },
    invoiceButton: {
        borderRadius: wp(2),
        borderWidth: wp(0.3),
        borderColor: strongPrimary,
        alignItems: "center",
        padding: wp(2),
        width: wp(25),
    },
});
