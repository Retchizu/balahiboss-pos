import { useEffect } from "react";
import { useCustomerContext } from "../../context/CustomerContext";
import { getCustomerData } from "../../methods/data-methods/getCustomerData";
import { User } from "../../types/type";
import { ToastType } from "react-native-toast-message";

export const useGetCustomers = (
  user: User | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  const { customers, setCustomerList } = useCustomerContext();
  useEffect(() => {
    if (customers.length === 0) {
      getCustomerData(setCustomerList, user, setIsLoading, showToast);
    }
  }, []);

  return {
    customers,
    setCustomerList,
  };
};
