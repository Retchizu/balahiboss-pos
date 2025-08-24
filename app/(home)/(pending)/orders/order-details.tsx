import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { primary, secondary, strongPrimary } from "@/theme/backgroundTheme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { usePendingOrderContext } from "@/contexts/PendingOrderContext";
import { router, useLocalSearchParams } from "expo-router";
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

const OrderDetailsScreen = () => {
  const { id, status } = useLocalSearchParams<{
    id: string;
    status: string;
  }>();
  const { orders } = usePendingOrderContext();
  const pendingOrder = orders[id];

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

        return { ...product, quantity: item.quantity, id: item.productId };
      });
    };

  const allChecked =
    convertTransactionItemsToSelectedProductArray().length > 0 &&
    convertTransactionItemsToSelectedProductArray().every(
      (product) => checked[product.id]
    );

  // for setting status
  const [orderStatusState, setOrderStatusState] = useState<PendingOrderStatus>(
    status as PendingOrderStatus
  );
  const [orderStatusModalVisible, setOrderStatusModalVisible] = useState(false);
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
      console.log(response.data.message);
      setOrderStatusModalVisible(false);
      router.back();
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response?.data.message);
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
        style={[styles.informationContainer, { maxHeight: hp(20) }]}
        contentContainerStyle={{ flexDirection: "column" }}
      >
        <Text style={styles.label}>Information:</Text>
        <Text style={styles.value}>{pendingOrder.orderInformation}</Text>
      </ScrollView>
      <View style={styles.informationContainer}>
        <Text style={styles.label}>Date: </Text>
        <Text style={[styles.value, { flex: 1 }]}>
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
        renderItem={({ item }) => {
          const product = products[item.productId];
          return (
            <View
              style={{
                flexDirection: "row",
                marginVertical: hp(0.5),
                borderRadius: wp(2),
                backgroundColor: secondary,
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
                  style={{ height: hp(8), width: wp(16), borderRadius: wp(3) }}
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
                    color: "#FF9149",
                    fontSize: wp(4),
                  }}
                >
                  Price: ₱{product.sellPrice.toFixed(2)}
                </Text>
                <Text
                  style={{
                    fontFamily: "Gantari-Regular",
                    fontSize: wp(4),
                  }}
                >
                  Quantity: {item.quantity}
                </Text>
              </View>
              {status === "pending" && (
                <Checkbox
                  value={checked[item.productId] || false}
                  onValueChange={(value) =>
                    setChecked((prev) => ({ ...prev, [item.productId]: value }))
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
      >
        <Text
          style={{
            fontFamily: "Gantari-SemiBold",
            fontSize: wp(4),
          }}
        >
          Set Order Status
        </Text>
        {orderStatusOptions.map((status: PendingOrderStatus) => (
          <TouchableOpacity
            key={status}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: hp(0.8),
              borderRadius: 8,
            }}
            onPress={() => {
              setSelectedOrderStatusOption(status);
              setOrderStatusState(status);
            }}
          >
            <Checkbox
              value={selectedOrderStatusOption === status}
              onValueChange={() => setSelectedOrderStatusOption(status)}
            />
            <Text style={{ fontSize: wp(3.5), marginLeft: wp(2) }}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}

        <CommonButton
          title="Confirm"
          onPress={ async () => {
            if (selectedOrderStatusOption) {
              await setOrderStatus();
            }
          }}
          titleColor={primary}
        />
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
    flexDirection: "row",
    backgroundColor: strongPrimary,
    padding: wp(2),
    borderRadius: wp(4),
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
