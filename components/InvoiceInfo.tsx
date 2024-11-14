import { StyleSheet, View } from "react-native";
import React from "react";
import { readableDate } from "../methods/time-methods/readableDate";
import { CustomerReportParams } from "../types/type";
import InfoHorizontal from "./InfoHorizontal";
import { calculateTotalProfit } from "../methods/calculation-methods/calculateTotalProfit";
import { calculateTotalPrice } from "../methods/calculation-methods/calculateTotalPrice";

type InvoiceInfoProp = {
  params: Readonly<
    CustomerReportParams & {
      fromSales: boolean;
    }
  >;
};

const InvoiceInfo: React.FC<InvoiceInfoProp> = ({ params }) => {
  return (
    <View>
      <InfoHorizontal
        label="Customer name"
        value={params.customer?.customerName!}
      />
      <InfoHorizontal
        label="Cash Payment"
        value={`₱ ${params.cashPayment.trim() ? params.cashPayment : "0"}`}
      />
      <InfoHorizontal
        label="Online Payment"
        value={`₱ ${params.onlinePayment.trim() ? params.onlinePayment : "0"}`}
      />
      <InfoHorizontal
        label="Date bought"
        value={params.date ? readableDate(new Date(params.date)) : ""}
      />
      <InfoHorizontal
        label="Discount"
        value={`₱${params.discount.trim() ? params.discount : "0"}`}
      />
      <InfoHorizontal
        label="Freebies"
        value={`₱${params.freebies.trim() ? params.freebies : "0"}`}
      />
      <InfoHorizontal
        label="Total amount"
        value={`₱${calculateTotalPrice(
          params.selectedProducts,
          undefined,
          parseFloat(params.discount.trim() ? params.discount : "0")
        ).toFixed(2)}`}
      />
      <InfoHorizontal
        label="Total profit"
        value={`₱${calculateTotalProfit(
          params.selectedProducts,
          parseFloat(params.discount.trim() ? params.discount : "0"),
          parseFloat(params.freebies.trim() ? params.freebies : "0")
        ).toFixed(2)}`}
      />
    </View>
  );
};

export default InvoiceInfo;

const styles = StyleSheet.create({});
