import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useActivityContext } from "@/contexts/ActivityContext";
import { primary } from "@/theme/backgroundTheme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { FieldChange } from "@/types/Activity";
import RenderLabelValuePair from "@/components/view/RenderLabelValuePair";
import Transaction from "@/types/Transaction";
import ActivityDetailCardView from "@/components/view/ActivityDetailCardView";
import { useProductContext } from "@/contexts/ProductContext";

const ProductActivityDetailScreen = () => {
  const { id }: { id: string } = useLocalSearchParams();

  const { activities } = useActivityContext();

  const activity = activities.find((activity) => activity.id === id);
  const {products} = useProductContext();

  const productFieldLabels: Record<string, string> = {
    productName: "Product Name",
    stockPrice: "Stock Price",
    sellPrice: "Sell Price",
    stock: "Stock",
    imageUrl: "Image",
    lowStockThreshold: "Low Stock Threshold",
  };

  const renderChangeValue = (field: string, value: unknown | null) => {
    if (field === "imageUrl" && value !== null) {
      return (
        <Image
          source={{ uri: value as string }}
          style={{ height: hp(10), width: wp(20), borderRadius: wp(2) }}
        />
      );
    }
    return <Text>{String(value ?? "—")}</Text>;
  };

  const renderTransactionChanges = (
    changes: Record<keyof Transaction, FieldChange> | null
  ) => {
    if (!changes) return null;

    return Object.entries(changes).map(([field, { before, after }]) => (
      <View key={field} style={{ marginBottom: hp(2) }}>
        <Text style={{ fontFamily: "Gantari-Medium", fontSize: wp(4) }}>
          {productFieldLabels[field]}
        </Text>
        <View style={{ marginLeft: wp(2) }}>
          <Text
            style={{
              color: "#FF9149",
              fontFamily: "Gantari-Regular",
              fontSize: wp(4),
            }}
          >
            Before:
          </Text>
          {renderChangeValue(field, before)}
          <Text
            style={{
              color: "#60B5FF",
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
          <Text style={styles.header}>Details</Text>
          <RenderLabelValuePair label="Actor" value={activity!.displayName} />
          <RenderLabelValuePair label="Type" value={activity!.entity} />
          <RenderLabelValuePair label="Name" value={products[activity!.entityId].productName} />
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
          <Text style={styles.header}>Changes</Text>
          {renderTransactionChanges(activity!.changes)}
        </ScrollView>
      </ActivityDetailCardView>
    </View>
  );
};

export default ProductActivityDetailScreen;

// cardView

// render key value

const styles = StyleSheet.create({
  header: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(5),
  },
});
