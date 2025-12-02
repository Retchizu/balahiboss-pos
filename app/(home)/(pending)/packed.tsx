import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useMemo, useState } from "react";
import { usePendingOrderContext } from "@/contexts/PendingOrderContext";
import usePendingOrdersArray from "@/hooks/usePendingOrdersArray";
import { useCustomerContext } from "@/contexts/CustomerContext";
import searchOrderByCustomerName from "@/methods/search/searchOrderByCustomerName";
import { primary, secondary } from "@/theme/backgroundTheme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import SearchBar from "@/components/searchbars/SearchBar";
import { router } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";

const PackedScreen = () => {
  const { orders } = usePendingOrderContext();

  const { pendingOrdersArray } = usePendingOrdersArray(orders);
  const { customers } = useCustomerContext();

  const completeArray = useMemo(() => {
    return pendingOrdersArray.filter((orders) => orders.status === "packed");
  }, [pendingOrdersArray]);

  const [searcQuery, setSearchQuery] = useState("");
  const filteredOrders = searchOrderByCustomerName(
    completeArray,
    customers,
    searcQuery
  );
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
        value={searcQuery}
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
        Packed
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
            No Packed Orders found.
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
                  backgroundColor: secondary,
                  marginVertical: hp(0.5),
                  padding: wp(3),
                  borderRadius: wp(4),
                  flexDirection: "row",
                  alignItems: "center",
                }}
                activeOpacity={0.7}
                onPress={() => {
                  router.push({
                    pathname: "../orders/order-details",
                    params: { id: item.id, fromPending: "false" },
                  });
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontFamily: "Gantari-SemiBold", fontSize: wp(4) }}
                  >
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
          style={{ marginTop: hp(1) }}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default PackedScreen;
