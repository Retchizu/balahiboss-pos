import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { InvoiceForm } from "../../types/type";

export const onChangeDateInvoice = (
  setIsDateVisible: React.Dispatch<React.SetStateAction<boolean>>,
  setInvoiceFormInfo: (value: React.SetStateAction<InvoiceForm>) => void,
  mode: "date" | "time",
  setMode: React.Dispatch<React.SetStateAction<"date" | "time">>
) => {
  return (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate;

    if (currentDate && selectedDate && event.type !== "dismissed") {
      if (mode === "date") {
        setInvoiceFormInfo((prev) => ({ ...prev, date: currentDate }));
        setMode("time");
      } else if (mode === "time" && event.type === "set") {
        setIsDateVisible(false);
        setInvoiceFormInfo((prev) => ({ ...prev, date: currentDate }));
        setMode("date");
      }
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
