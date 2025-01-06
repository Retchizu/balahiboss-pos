import { PaymentMethodFilter } from "../../types/type";

export const chooseFilterTypeWithPaymentMethodForSaleslist = (
  key: number,
  setPaymentMethodFIlter: React.Dispatch<
    React.SetStateAction<PaymentMethodFilter>
  >
) => {
  switch (key) {
    case 1:
      setPaymentMethodFIlter("cash");
      break;
    case 2:
      setPaymentMethodFIlter("online");
      break;
    case 3:
      setPaymentMethodFIlter("none");
      break;
  }
};

export const paymentMethodFilterChoices = [
  { key: 1, choiceName: "Cash Payment" },
  { key: 2, choiceName: "Online Payment" },
  { key: 3, choiceName: "None" },
];
