import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useActivityContext } from "@/contexts/ActivityContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { FieldChange } from "@/types/Activity";
import RenderLabelValuePair from "@/components/view/RenderLabelValuePair";
import Transaction from "@/types/Transaction";
import ActivityDetailCardView from "@/components/view/ActivityDetailCardView";
import { useCustomerContext } from "@/contexts/CustomerContext";

const CustomerActivityDetailScreen = () => {
  const { primary, strongPrimary, textMuted, textOnPrimary } = useTheme();
  const { id }: { id: string } = useLocalSearchParams();

  const { activities } = useActivityContext();
  const {customers} = useCustomerContext();

  const activity = activities.find((activity) => activity.id === id);

  const customerFieldLabels: Record<string, string> = {
    customerName: "Customer Name",
    customerInfo: "Customer Information"
  };

  const renderChangeValue = (field: string, value: unknown | null) => {
    return <Text style={{ color: textOnPrimary }}>{String(value ?? "—")}</Text>;
  };

  const renderTransactionChanges = (
    changes: Record<keyof Transaction, FieldChange> | null
  ) => {
    if (!changes) return null;

    return Object.entries(changes).map(([field, { before, after }]) => (
      <View key={field} style={{ marginBottom: hp(2) }}>
        <Text style={{ fontFamily: "Gantari-Medium", fontSize: wp(4), color: textOnPrimary }}>
          {customerFieldLabels[field]}
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
          <RenderLabelValuePair label="Name" value={customers[activity!.entityId].customerName} />
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

export default CustomerActivityDetailScreen;

// cardView


// render key value

const styles = StyleSheet.create({
  header: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(5),
  },
});
