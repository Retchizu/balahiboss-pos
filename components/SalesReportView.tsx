import { StyleSheet, Text, View } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { SalesReport } from "../types/type";
import { calculateTotalPrice } from "../methods/calculation-methods/calculateTotalPrice";
import { calculateOverallTotalPrice } from "../methods/calculation-methods/calculateOverallTotalPrice";
import { calculateTotalProfit } from "../methods/calculation-methods/calculateTotalProfit";
import { calculateOverallCashPayment } from "../methods/calculation-methods/calculateOverallCashPayment";
import { calculateOverallOnlinePayment } from "../methods/calculation-methods/calculateOverallOnlinePayment";
import { calculateOverallDiscount } from "../methods/calculation-methods/calculateOverallDiscount";
import { calculateOverallFreebies } from "../methods/calculation-methods/calculateOverallFreebies";

type SalesReportViewProp = {
  salesReportList: SalesReport[];
};
const SalesReportView = ({ salesReportList }: SalesReportViewProp) => {
  return (
    <View style={styles.reportViewContainer}>
      <View style={styles.rowFormat}>
        <Text style={styles.text}>Total Cash Payment: </Text>
        <Text style={styles.text}>
          ₱ {calculateOverallCashPayment(salesReportList).toFixed(2)}
        </Text>
      </View>
      <View style={styles.rowFormat}>
        <Text style={styles.text}>Total Online Payment: </Text>
        <Text style={styles.text}>
          ₱ {calculateOverallOnlinePayment(salesReportList).toFixed(2)}
        </Text>
      </View>
      <View style={styles.rowFormat}>
        <Text style={styles.text}>Total Discount: </Text>
        <Text style={styles.text}>
          ₱{calculateOverallDiscount(salesReportList).toFixed(2)}
        </Text>
      </View>
      <View style={styles.rowFormat}>
        <Text style={styles.text}>Total Freebies: </Text>
        <Text style={styles.text}>
          ₱{calculateOverallFreebies(salesReportList).toFixed(2)}
        </Text>
      </View>
      <View style={styles.rowFormat}>
        <Text style={styles.text}>Total Payment: </Text>
        <Text style={styles.text}>
          ₱
          {(
            calculateOverallCashPayment(salesReportList) +
            calculateOverallOnlinePayment(salesReportList)
          ).toFixed(2)}
        </Text>
      </View>
      <View style={styles.rowFormat}>
        <Text style={styles.text}>Total Price Sold: </Text>
        <Text style={styles.text}>
          ₱
          {calculateOverallTotalPrice(
            salesReportList,
            calculateTotalPrice
          ).toFixed(2)}
        </Text>
      </View>
      <View style={styles.rowFormat}>
        <Text style={styles.text}>Total Profit: </Text>
        <Text style={styles.text}>
          ₱{" "}
          {calculateOverallTotalPrice(
            salesReportList,
            calculateTotalProfit
          ).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

export default SalesReportView;

const styles = StyleSheet.create({
  reportViewContainer: {
    borderWidth: wp(0.3),
    borderRadius: wp(1.5),
    padding: wp(1),
  },
  rowFormat: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  text: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(4),
  },
});
