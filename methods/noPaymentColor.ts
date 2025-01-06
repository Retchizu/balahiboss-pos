import { ColorValue } from "react-native";

export const noPaymentColor = (
  cashPayment: string,
  onlinePayment: string
): ColorValue => {
  const convertCashPaymentToNumber = isNaN(parseFloat(cashPayment))
    ? 0
    : parseFloat(cashPayment);
  const convertOnlinePaymentToNumber = isNaN(parseFloat(onlinePayment))
    ? 0
    : parseFloat(onlinePayment);

  if (convertCashPaymentToNumber === 0 && convertOnlinePaymentToNumber === 0)
    return "#ff6347";

  return "#000000";
};
