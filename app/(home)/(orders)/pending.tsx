import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useMemo, useState } from "react";
import { usePendingOrderContext } from "@/contexts/PendingOrderContext";
import usePendingOrdersArray from "@/hooks/usePendingOrdersArray";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { primary, strongPrimary } from "@/theme/backgroundTheme";
import SearchBar from "@/components/searchbars/SearchBar";
import { router } from "expo-router";
import { useCustomerContext } from "@/contexts/CustomerContext";
import { FontAwesome6 } from "@expo/vector-icons";
import searchOrderByCustomerName from "@/methods/search/searchOrderByCustomerName";
import PendingOrder from "@/types/PendingOrder";
import { auth } from "@/config/firebaseConfig";
import { api } from "@/config/axios-api";
import { isAxiosError } from "axios";
import Toast from "react-native-toast-message";

const PendingScreen = () => {
  const { orders } = usePendingOrderContext();
  // rename pendingOrders to Orders in the futre
  const { pendingOrdersArray } = usePendingOrdersArray(orders);
  const { customers } = useCustomerContext();

  const pendingArray = useMemo(() => {
    return pendingOrdersArray.filter((orders) => orders.status === "pending");
  }, [pendingOrdersArray]);

  //search query
  const [searchQuery, setSearchQuery] = useState("");
  const filteredOrders = searchOrderByCustomerName(
    pendingArray,
    customers,
    searchQuery
  );

  const currentUser = auth.currentUser;
  const handlePendingCardViewBackgroundColor = (item: PendingOrder) => {
    if (item.checkedBy && item.checkedBy.includes(currentUser?.uid!)) {
      return "rgba(255,255,255,0.85)";
    }

    return strongPrimary;
  };

  const [markAsReadLoading, setMarkAsReadLoading] = useState(false);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(5),
      }}
    >
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search Customers..."
      />
      <Text
        style={{
          fontFamily: "Gantari-Medium",
          fontSize: wp(5),
          textAlign: "center",
          marginVertical: hp(1),
        }}
      >
        Pending
      </Text>

      {filteredOrders.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: hp(2),
          }}
        >
          <Text
            style={{
              fontFamily: "Gantari-Regular",
              fontSize: wp(4),
              color: "#6B7280",
            }}
          >
            No Pending Orders found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => {
            const customer = customers[item.transaction.customerId];
            return (
              <TouchableOpacity
                style={{
                  backgroundColor: handlePendingCardViewBackgroundColor(item),
                  marginVertical: hp(0.5),
                  padding: wp(3),
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.6)",
                  borderRadius: wp(4),
                  flexDirection: "row",
                  alignItems: "center",
                }}
                activeOpacity={0.7}
                onPress={async () => {
                  try {
                    setMarkAsReadLoading(true);
                    if (!item.checkedBy.includes(currentUser?.uid!)) {
                      await api.post(
                        "/orders/view",
                        {},
                        {
                          params: { transactionId: item.id },
                        }
                      );
                    }
                    router.push({
                      pathname: "../orders/order-details",
                      params: { id: item.id, status: item.status },
                    });
                  } catch (error) {
                    if (isAxiosError(error)) {
                      Toast.show({
                        type: "error",
                        text1: `${error.response?.data.error}`,
                      });
                    }
                    console.error(error);
                  } finally {
                    setMarkAsReadLoading(false);
                  }
                }}
                disabled={markAsReadLoading}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Gantari-SemiBold", fontSize: wp(4) }}>
                    {customer.customerName}
                  </Text>
                  {customer.customerInfo && (
                    <Text
                      numberOfLines={1}
                      style={{ fontFamily: "Gantari-Regular", fontSize: wp(4) }}
                    >
                      {customer.customerInfo}
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: wp(1),
                  }}
                >
                  <FontAwesome6 name="clock-four" size={wp(4)} color="black" />
                  <Text>
                    {new Date(item.date)
                      ?.toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                      .replace(",", "")
                      .replace(/AM|PM/, (m) => m.toLowerCase())}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          style={{
            marginTop: hp(1),
            opacity: markAsReadLoading ? 0.2 : 1,
            zIndex: 1,
          }}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
        />
      )}
      {markAsReadLoading && (
        <ActivityIndicator
          color={strongPrimary}
          size={wp(10)}
          style={{ zIndex: 2, position: "absolute", top: hp(46), left: wp(46) }}
        />
      )}
    </View>
  );
};

export default PendingScreen;
