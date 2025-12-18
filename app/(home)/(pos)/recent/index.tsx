import { FlatList, Text, TouchableOpacity, View } from "react-native";

import React, { useMemo } from "react";

import { primary } from "@/theme/backgroundTheme";

import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";

import { useRecentTransactionContext } from "@/contexts/RecentTransactionContext";

import { useCustomerContext } from "@/contexts/CustomerContext";

import { FontAwesome6 } from "@expo/vector-icons";

import { router } from "expo-router";
import { useProductContext } from "@/contexts/ProductContext";

const RecentTransactionScreen = () => {
    const { recentTransactions } = useRecentTransactionContext();

    const { customers } = useCustomerContext();
    const { products } = useProductContext();

    const sortedRecentTransactions = useMemo(() => {
        return recentTransactions.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recentTransactions, products]);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: primary,
                paddingVertical: hp(2),
                paddingHorizontal: wp(2),
            }}
        >
            <Text
                style={{
                    fontFamily: "Gantari-Medium",
                    fontSize: wp(4.5),
                    textAlign: "center",
                    marginBottom: hp(1),
                }}
            >
                Today&apos;s Transactions
            </Text>
            <FlatList
                data={sortedRecentTransactions}
                renderItem={({ item, index }) => {
                    const customerName =
                        customers[item.customerId].customerName;

                    return (
                        <TouchableOpacity
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                borderRadius: wp(4),
                                backgroundColor: "rgba(255,255,255,0.85)",
                                borderColor: "rgba(0,0,0,0.6)",
                                borderWidth: 1,
                                padding: wp(2),
                                alignItems: "center",
                                marginVertical: hp(0.5),
                            }}
                            activeOpacity={0.7}
                            onPress={() => {
                                router.push({
                                    pathname: "./recent/details",
                                    params: { recentId: item.id },
                                });
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: "Gantari-Regular",
                                    fontSize: wp(4),
                                    maxWidth: wp(70),
                                }}
                            >
                                {
                                    <Text
                                        style={{
                                            fontFamily: "Gantari-SemiBold",
                                            fontSize: wp(4),
                                            maxWidth: wp(70),
                                        }}
                                    >
                                      {index + 1}. {" "}
                                    </Text>
                                }
                                 {customerName}
                            </Text>

                            <View
                                style={{
                                    flexDirection: "row",

                                    alignItems: "center",

                                    gap: wp(1),
                                }}
                            >
                                <FontAwesome6
                                    name="clock-four"
                                    size={wp(4)}
                                    color="black"
                                />

                                <Text
                                    style={{
                                        fontFamily: "Gantari-Regular",
                                        fontSize: wp(4),
                                    }}
                                >
                                    {new Date(item.date).toLocaleTimeString(
                                        [],
                                        {
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                        }
                                    )}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

export default RecentTransactionScreen;
