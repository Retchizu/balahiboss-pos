import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useRef } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { handleInputChange } from "../methods/handleInputChange";
import { Button } from "@rneui/base";
import { Customer } from "../types/type";

type CustomerFormProps = {
  customer: {
    customerName: string;
    customerInfo: string;
  };

  setCustomer: React.Dispatch<
    React.SetStateAction<{
      customerName: string;
      customerInfo: string;
    }>
  >;
  buttonLabel: string;
  formTitle: string;
  submit: () => void;
};

const CustomerForm = ({
  customer,
  setCustomer,
  buttonLabel,
  formTitle,
  submit,
}: CustomerFormProps) => {
  const textInputRef = useRef<TextInput | null>(null);

  const showKeyboard = () => {
    textInputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <View style={styles.formParentContainer}>
        <Text style={styles.customerFormTitle}>{formTitle}</Text>
        <Text style={styles.labelStyle}>Customer name:</Text>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.textInputStyle}
            placeholder="Customer name"
            value={customer.customerName}
            onChangeText={(text) =>
              handleInputChange("customerName", text, setCustomer)
            }
            maxLength={40}
          />
        </View>
        <Text style={styles.labelStyle}>Customer Info:</Text>
        <TouchableOpacity
          style={[styles.formContainer, { height: hp(30) }]}
          activeOpacity={1}
          onPress={showKeyboard}
        >
          <TextInput
            multiline
            maxLength={300}
            ref={textInputRef}
            style={styles.textInputStyle}
            placeholder="Customer info"
            value={customer.customerInfo}
            onChangeText={(text) =>
              handleInputChange("customerInfo", text, setCustomer)
            }
          />
        </TouchableOpacity>
        <Button
          title={buttonLabel}
          buttonStyle={styles.buttonStyle}
          titleStyle={styles.titleStyle}
          onPress={() => submit()}
        />
      </View>
    </View>
  );
};

export default CustomerForm;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F0E9",
  },
  formParentContainer: {
    borderWidth: wp(0.3),
    borderColor: "#634F40",
    padding: wp(10),
  },
  formContainer: {
    borderWidth: wp(0.3),
    borderColor: "#634F40",
    borderRadius: wp(1.5),
  },
  labelStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(4),
  },
  textInputStyle: {
    fontFamily: "SoraRegular",
    fontSize: wp(4),
    padding: wp(1),
  },
  buttonStyle: {
    backgroundColor: "#E6B794",
    marginVertical: hp(1),
    borderRadius: wp(1.5),
  },
  titleStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(4),
  },
  customerFormTitle: {
    fontFamily: "SoraBold",
    fontSize: wp(5),
    textAlign: "center",
    paddingVertical: hp(2),
  },
});
