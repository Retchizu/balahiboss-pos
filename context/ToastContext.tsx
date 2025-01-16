import React, { createContext, ReactNode, useContext } from "react";
import Toast, { ToastType } from "react-native-toast-message";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type ToastContextType = {
  showToast: (type: ToastType, text1: string, text2?: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const showToast = (type: ToastType, text1: string, text2?: string) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
      text1Style: {
        fontFamily: "SoraBold",
        fontSize: wp(3.5),
      },
      text2Style: {
        fontFamily: "SoraMedium",
        fontSize: wp(3),
      },
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

// Hook to use the Toast context
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
