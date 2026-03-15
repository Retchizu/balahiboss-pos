import { View, Text, StyleSheet, ScrollView } from "react-native";
import React, { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { useActivityContext } from "@/contexts/ActivityContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { FieldChange } from "@/types/Activity";
import { useProductContext } from "@/contexts/ProductContext";
import RenderLabelValuePair from "@/components/view/RenderLabelValuePair";
import Transaction from "@/types/Transaction";
import ActivityDetailCardView from "@/components/view/ActivityDetailCardView";
import { useCustomerContext } from "@/contexts/CustomerContext";
import { useTransactionContext } from "@/contexts/TransactionContext";

const TransactionActivityDetailScreen = () => {
  const { primary, strongPrimary, textMuted, textOnPrimary } = useTheme();
  const { id }: { id: string } = useLocalSearchParams();

  const { activities } = useActivityContext();
  //for finding product in transaction
  const { products } = useProductContext();
  // for finding customer in transaction
  const { customers } = useCustomerContext();

  const activity = activities.find((activity) => activity.id === id);
  // transcation
  const { transactions } = useTransactionContext();
  const transaction = useMemo(() => {
    return transactions.find((t) => t.id === activity?.entityId) ?? null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const transactionFieldLabels: Record<string, string> = {
    customerId: "Customer",
    date: "Date",
    deliveryFee: "Delivery Fee",
    discount: "Discount",
    items: "Items",
    cashPayment: "Cash Payment",
    onlinePayment: "Online Payment",
    freebies: "Freebies",
    orderInformation: "Order Information",
  };

  const renderChangeValue = (field: string, value: unknown | null) => {
    console.log(value);
    if (field === "items" && Array.isArray(value)) {
      return (
        <View style={{ marginLeft: wp(3) }}>
          {value.map((item: { productId: string; quantity: number }, i) => {
            const productName =
              products[item.productId]?.productName ?? "Product might deleted";
              return (
              <Text key={i} style={[styles.value, { color: textOnPrimary }]}>
                {productName} — {item.quantity}
              </Text>
            );
          })}
        </View>
      );
    }

    if (field === "customerId" && value !== null) {
      const customerName =
        customers[value as string].customerName ?? "Customer might be deleted";
      return <Text style={[styles.value, { color: textOnPrimary }]}>{customerName}</Text>;
    }
    if (field === "date" && value !== null) {
      return (
        <Text style={[styles.value, { color: textOnPrimary }]}>
          {new Date(value as string).toLocaleString("en-PH", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </Text>
      );
    }

    return <Text style={[styles.value, { color: textOnPrimary }]}>{String(value ?? "—")}</Text>;
  };

  const renderTransactionChanges = (
    changes: Record<keyof Transaction, FieldChange> | null
  ) => {
    if (!changes) return null;

    return Object.entries(changes).map(([field, { before, after }]) => (
      <View key={field} style={{ marginBottom: hp(2) }}>
        <Text style={{ fontFamily: "Gantari-Medium", fontSize: wp(4), color: textOnPrimary }}>
          {transactionFieldLabels[field]}
        </Text>
        <View style={{ marginLeft: wp(2) }}>
          <Text
            style={{
              color: strongPrimary,
              fontFamily: "Gantari-Regular",
              fontSize: wp(4),
            }}
          >
            Before:
          </Text>
          {renderChangeValue(field, before)}
          <Text
            style={{
              color: textMuted,
              fontFamily: "Gantari-Regular",
              fontSize: wp(4),
            }}
          >
            After:
          </Text>
          {renderChangeValue(field, after)}
        </View>
      </View>
    ));
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: primary,
        paddingVertical: hp(2),
        paddingHorizontal: wp(2),
        gap: hp(2),
      }}
    >
      <ActivityDetailCardView>
        <View style={{ gap: hp(0.5) }}>
          <Text style={[styles.header, { color: textOnPrimary }]}>Details</Text>
          <RenderLabelValuePair label="Actor" value={activity!.displayName} />
          <RenderLabelValuePair label="Type" value={activity!.entity} />
          <RenderLabelValuePair
            label="Name"
            value={
              transaction ? customers[transaction.customerId].customerName : ""
            }
          />
          <RenderLabelValuePair label="Action" value={activity!.action} />
          <RenderLabelValuePair
            label="Date"
            value={new Date(activity!.date).toLocaleString("en-PH", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          />
        </View>
      </ActivityDetailCardView>

      <ActivityDetailCardView height={hp(65)}>
        <ScrollView>
          <Text style={[styles.header, { color: textOnPrimary }]}>Changes</Text>
          {renderTransactionChanges(activity!.changes)}
        </ScrollView>
      </ActivityDetailCardView>
    </View>
  );
};

export default TransactionActivityDetailScreen;

// cardView

// render key value

const styles = StyleSheet.create({
  header: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(5),
  },
  value: {
    fontFamily: "Gantari-Regular",
    fontSize: wp(4),
  },
});
