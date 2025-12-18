import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    Image,
    TouchableOpacity,
    BackHandler,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { primary, strongPrimary } from "@/theme/backgroundTheme";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { usePendingOrderContext } from "@/contexts/PendingOrderContext";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCustomerContext } from "@/contexts/CustomerContext";
import { useProductContext } from "@/contexts/ProductContext";
import { Checkbox } from "expo-checkbox";
import calculateTotalSellPrice from "@/methods/invoice/calculateTotalSellPrice";
import SelectedProduct from "@/types/SelectedProduct";
import CommonButton from "@/components/buttons/CommonButton";
import { api } from "@/config/axios-api";
import { isAxiosError } from "axios";
import { PendingOrderStatus } from "@/types/PendingOrder";
import ModalTemplate from "@/components/modals/ModalTemplate";
import { Entypo } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const OrderDetailsScreen = () => {
    const { id, status } = useLocalSearchParams<{
        id: string;
        status: string;
    }>();
    const { orders } = usePendingOrderContext();
    const pendingOrder = orders[id];

    useEffect(() => {
        if (!pendingOrder) {
            router.back();
        }
    }, [pendingOrder]);

    useFocusEffect(
        useCallback(() => {
            const backFn = () => {
                switch (pendingOrder.status) {
                    case "pending":
                        router.navigate("/(home)/(pending)/pending");
                        break;
                    case "packed":
                        router.navigate("/(home)/(pending)/packed");
                        break;
                    case "complete":
                        router.navigate("/(home)/(pending)/complete");
                        break;
                }
                return true;
            };

            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                backFn
            );

            return () => backHandler.remove();
        }, [pendingOrder.status])
    );

    // customer detail
    const { customers } = useCustomerContext();
    const customer = customers[pendingOrder.transaction.customerId];

    // products for items bought
    const { products } = useProductContext();
    const [checked, setChecked] = useState<Record<string, boolean>>({});

    const convertTransactionItemsToSelectedProductArray =
        (): SelectedProduct[] => {
            return pendingOrder.transaction.items.map((item) => {
                const product = products[item.productId];

                return {
                    ...product,
                    quantity: item.quantity,
                    id: item.productId,
                };
            });
        };

    const allChecked =
        convertTransactionItemsToSelectedProductArray().length > 0 &&
        convertTransactionItemsToSelectedProductArray().every(
            (product) => checked[product.id]
        );

    // for setting status
    const [orderStatusState, setOrderStatusState] =
        useState<PendingOrderStatus>(status as PendingOrderStatus);
    const [orderStatusModalVisible, setOrderStatusModalVisible] =
        useState(false);
    const orderStatusOptions: PendingOrderStatus[] = [
        "pending",
        "packed",
        "complete",
    ];
    const [selectedOrderStatusOption, setSelectedOrderStatusOption] =
        useState(orderStatusState);

    const [markOrderLoading, setMarkOrderLoading] = useState(false);

    const setOrderStatus = async () => {
        try {
            setMarkOrderLoading(true);
            const response = await api.post(
                "/pending-order/status",
                {
                    status: selectedOrderStatusOption,
                },
                {
                    params: { transactionId: id },
                }
            );
            Toast.show({ type: "success", text1: `${response?.data.message}` });
            setOrderStatusModalVisible(false);
            router.back();
        } catch (error) {
            if (isAxiosError(error)) {
                Toast.show({
                    type: "error",
                    text1: `${error.response?.data.error}`,
                });
            }
            console.log(error);
        } finally {
            setMarkOrderLoading(false);
        }
    };

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: primary,
                paddingVertical: hp(2),
                paddingHorizontal: wp(5),
                gap: hp(1),
            }}
        >
            <View style={styles.informationContainer}>
                <Text style={styles.label}>Customer: </Text>
                <Text style={styles.value}>{customer.customerName}</Text>
            </View>
            <ScrollView
                style={styles.informationContainer}
                contentContainerStyle={{
                    flexDirection: "column",
                    height: hp(10),
                }}
            >
                <Text style={styles.label}>Information:</Text>
                <Text style={styles.value}>
                    {pendingOrder.orderInformation}
                </Text>
            </ScrollView>
            <View style={styles.informationContainer}>
                <Text style={styles.label}>Date: </Text>
                <Text style={[styles.value]}>
                    {new Date(pendingOrder.date).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                    })}
                </Text>
            </View>
            <Text style={styles.label}>
                {status === "pending" ? "Please Prepare:" : "Prepared:"}
            </Text>
            <FlatList
                data={pendingOrder.transaction.items}
                style={{ height: hp(30) }}
                renderItem={({ item }) => {
                    const product = products[item.productId];
                    return (
                        <View
                            style={{
                                flexDirection: "row",
                                marginVertical: hp(0.5),
                                borderRadius: wp(2),
                                backgroundColor: "rgba(255,255,255,0.85)",
                                borderWidth: 1,
                                borderColor: "rgba(0,0,0,0.6)",
                                alignItems: "center",
                            }}
                        >
                            <View
                                style={{
                                    borderColor: "#FF9149",
                                    borderWidth: wp(0.2),
                                    height: hp(8),
                                    width: wp(16),
                                    borderRadius: wp(3),
                                }}
                            >
                                <Image
                                    source={
                                        product.imageUrl
                                            ? { uri: product.imageUrl }
                                            : require("../../../../assets/balahiboss.png")
                                    }
                                    style={{
                                        height: hp(8),
                                        width: wp(16),
                                        borderRadius: wp(3),
                                    }}
                                />
                            </View>
                            <View
                                style={{
                                    maxWidth: wp(65),
                                    paddingHorizontal: wp(1.5),
                                    flex: 1,
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: "Gantari-SemiBold",
                                        fontSize: wp(4.5),
                                    }}
                                >
                                    {product.productName}
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: "Gantari-Regular",
                                        fontSize: wp(4),
                                    }}
                                >
                                    Price: ₱{product.sellPrice.toFixed(2)}
                                </Text>
                                <View style={{ flexDirection: "row" }}>
                                    <Text
                                        style={{
                                            fontFamily: "Gantari-Regular",
                                            fontSize: wp(4),
                                        }}
                                    >
                                        {"Quantity: "}
                                    </Text>
                                    <Text
                                        style={{
                                            fontFamily: "Gantari-Medium",
                                            fontSize: wp(4),
                                            color: "#ff6347",
                                        }}
                                    >
                                        {item.quantity}
                                    </Text>
                                </View>
                            </View>
                            {status === "pending" && (
                                <Checkbox
                                    value={checked[item.productId] || false}
                                    onValueChange={(value) =>
                                        setChecked((prev) => ({
                                            ...prev,
                                            [item.productId]: value,
                                        }))
                                    }
                                />
                            )}
                        </View>
                    );
                }}
            />
            <View
                style={{
                    backgroundColor: primary,
                    borderRadius: wp(4),
                }}
            >
                {/* Shadow Top Border */}
                <View
                    style={{
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
                >
                    {/* Main Content */}
                    <View style={{ padding: 16, gap: hp(1) }}>
                        <View style={styles.totalView}>
                            <Text style={styles.totalLabel}>Total Price:</Text>
                            <Text style={styles.totalValue}>
                                ₱
                                {calculateTotalSellPrice(
                                    convertTransactionItemsToSelectedProductArray(),
                                    pendingOrder.transaction.discount.toString()
                                ).toFixed(2)}
                            </Text>
                        </View>
                        <CommonButton
                            title={"Set Status"}
                            onPress={() => {
                                if (!allChecked && status === "pending") {
                                    console.log("There are items unchecked");
                                    return;
                                }
                                setOrderStatusModalVisible(true);
                            }}
                            titleColor={primary}
                            loading={markOrderLoading}
                        />
                    </View>
                </View>
            </View>
            <ModalTemplate
                visible={orderStatusModalVisible}
                onClose={() => setOrderStatusModalVisible(false)}
                height={hp(50)}
                width={wp(88)}
            >
                <View
                    style={{ alignItems: "center", paddingHorizontal: wp(3) }}
                >
                    <Entypo
                        name="swap"
                        size={wp(12)}
                        color={strongPrimary}
                        style={{ marginBottom: hp(1) }}
                    />
                    <Text
                        style={{
                            fontFamily: "Gantari-Bold",
                            fontSize: wp(5),
                            textAlign: "center",
                        }}
                    >
                        Set Order Status
                    </Text>
                    <Text
                        style={{
                            fontFamily: "Gantari-Regular",
                            fontSize: wp(3.8),
                            color: "#6B7280",
                            textAlign: "center",
                            marginTop: hp(0.8),
                            lineHeight: hp(2),
                        }}
                    >
                        Choose a new status for this order. Changing the status
                        will update the order list accordingly.
                    </Text>
                </View>

                <View style={{ marginTop: hp(2), paddingHorizontal: wp(2) }}>
                    {orderStatusOptions.map((status: PendingOrderStatus) => {
                        const isSelected = selectedOrderStatusOption === status;
                        return (
                            <TouchableOpacity
                                key={status}
                                activeOpacity={0.8}
                                onPress={() => {
                                    setSelectedOrderStatusOption(status);
                                    setOrderStatusState(status);
                                }}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingVertical: hp(1.2),
                                    paddingHorizontal: wp(3),
                                    borderRadius: wp(2),
                                    backgroundColor: isSelected
                                        ? "rgba(0,122,255,0.06)"
                                        : "transparent",
                                    marginBottom: hp(0.8),
                                }}
                            >
                                <Checkbox
                                    value={isSelected}
                                    onValueChange={() => {
                                        setSelectedOrderStatusOption(status);
                                        setOrderStatusState(status);
                                    }}
                                />
                                <Text
                                    style={{
                                        marginLeft: wp(3),
                                        fontSize: wp(4),
                                        fontFamily: isSelected
                                            ? "Gantari-SemiBold"
                                            : "Gantari-Regular",
                                        color: isSelected
                                            ? strongPrimary
                                            : "#111827",
                                    }}
                                >
                                    {status.charAt(0).toUpperCase() +
                                        status.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
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
                        onPress={() => setOrderStatusModalVisible(false)}
                        backgroundColor="#F3F4F6"
                        titleColor="#111827"
                        marginTop={0}
                    />
                    <CommonButton
                        title="Confirm"
                        onPress={async () => {
                            if (selectedOrderStatusOption) {
                                await setOrderStatus();
                            }
                        }}
                        backgroundColor={strongPrimary}
                        titleColor={primary}
                        marginTop={0}
                        loading={markOrderLoading}
                    />
                </View>
            </ModalTemplate>
        </View>
    );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
    label: {
        fontSize: wp(5),
        fontFamily: "Gantari-SemiBold",
    },
    value: {
        fontSize: wp(5),
        fontFamily: "Gantari-Regular",
    },
    informationContainer: {
        backgroundColor: "rgba(255,255,255,0.85)",
        padding: wp(2),
        borderRadius: wp(4),
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.6)",
    },
    totalView: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    totalValue: {
        fontFamily: "Gantari-Bold",
        fontSize: wp(5),
        color: strongPrimary,
    },
    totalLabel: {
        fontSize: wp(5),
        fontFamily: "Gantari-Regular",
    },
});
