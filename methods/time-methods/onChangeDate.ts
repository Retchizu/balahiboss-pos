import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { InvoiceForm } from "../../types/type";

export const onChangeDateInvoice = (
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>,
  setInvoiceFormInfo: (value: React.SetStateAction<InvoiceForm>) => void
) => {
  return (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate;

    if (currentDate && selectedDate && event.type !== "dismissed") {
      setIsVisible(false);
      setInvoiceFormInfo((prev) => ({ ...prev, date: currentDate }));
    } else {
      setIsVisible(false);
    }
  };
};

export const onChangeDateRange = (
  setIsDateVisible: React.Dispatch<React.SetStateAction<boolean>>,
  setDate: React.Dispatch<React.SetStateAction<Date | null>>
) => {
  return (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate;
    if (currentDate && setDate && event.type !== "dismissed") {
      setIsDateVisible(false);
      setDate(currentDate);
    }
    setIsDateVisible(false);
  };
};
