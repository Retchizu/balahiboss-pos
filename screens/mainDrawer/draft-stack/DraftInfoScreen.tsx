import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { DraftInfoScreenProp } from "../../../types/type";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import InfoHorizontal from "../../../components/InfoHorizontal";
import { readableDate } from "../../../methods/time-methods/readableDate";
import InvoiceInfo from "../../../components/InvoiceInfo";
import InvoiceProductsInfo from "../../../components/InvoiceProductsInfo";
import { Button } from "@rneui/base";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { deleteDraftData } from "../../../methods/data-methods/deleteDraftData";
import { useDraftContext } from "../../../context/DraftContext";
import { useUserContext } from "../../../context/UserContext";
import { useToastContext } from "../../../context/ToastContext";
import Toast from "react-native-toast-message";
import { useInvoiceContext } from "../../../context/InvoiceContext";
import { useSelectedProductContext } from "../../../context/SelectedProductContext";

const DraftInfoScreen = ({ navigation, route }: DraftInfoScreenProp) => {
  const { invoiceForm, selectedProduct } = route.params;
  const draftCreatedAt = new Date(route.params.createdAt!);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false);
  const { setDraftList, drafts } = useDraftContext();
  const { user } = useUserContext();
  const { showToast } = useToastContext();
  const { setInvoiceForm } = useInvoiceContext();
  const { setSelectedProductList } = useSelectedProductContext();

  const draftObject = {
    id: route.params.id,
    cashPayment: invoiceForm.cashPayment,
    onlinePayment: invoiceForm.onlinePayment,
    customer: invoiceForm.customer,
    date: invoiceForm.date,
    deliveryFee: invoiceForm.deliveryFee,
    discount: invoiceForm.discount,
    freebies: invoiceForm.discount,
    selectedProducts: selectedProduct,
    fromSales: false,
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={[
          styles.container,
          { opacity: isConfirmationModalVisible ? 0.1 : 1 },
        ]}
      >
        <Text style={styles.draftTitle}>{route.params.draftTitle}</Text>
        <InfoHorizontal
          label="Created at"
          value={readableDate(draftCreatedAt)}
        />
        <InvoiceInfo params={draftObject} />
        <InvoiceProductsInfo params={draftObject} />
        <View style={styles.buttonContainer}>
          <Button
            icon={<Entypo name="trash" size={26} color="#F3F0E9" />}
            buttonStyle={styles.buttonStyle}
            onPress={() => setIsConfirmationModalVisible(true)}
          />
          <Button
            icon={<AntDesign name="form" size={26} color="#F3F0E9" />}
            buttonStyle={styles.buttonStyle}
            onPress={() => {
              setInvoiceForm({
                ...invoiceForm,
                date: invoiceForm.date ? new Date(invoiceForm.date) : null,
              });
              const selectedProductMap = new Map();
              selectedProduct.forEach((selectedProduct) => {
                selectedProductMap.set(selectedProduct.id, selectedProduct);
              });
              setSelectedProductList(selectedProductMap);
              navigation.navigate("POSScreen", {
                screen: "InvoiceStackScreen",
              });
            }}
          />
        </View>
      </View>
      <ConfirmationModal
        isVisible={isConfirmationModalVisible}
        confirmationTitle={"Delete draft?"}
        confirmationDescription={`Delete ${route.params.draftTitle}?`}
        setIsVisible={setIsConfirmationModalVisible}
        cancelFn={() => setIsConfirmationModalVisible(false)}
        confirmFn={async () => {
          navigation.pop();
          navigation.replace("DraftScreen");
          await deleteDraftData(
            user,
            route.params.id,
            drafts,
            setDraftList,
            showToast
          );
        }}
      />
    </View>
  );
};

export default DraftInfoScreen;

const styles = StyleSheet.create({
  draftTitle: {
    textAlign: "center",
    fontFamily: "SoraSemiBold",
    fontSize: wp(5),
    paddingVertical: hp(1),
  },

  container: {
    flex: 1,
    paddingHorizontal: wp(6),
    backgroundColor: "#F3F0E9",
  },
  buttonStyle: {
    backgroundColor: "#E6B794",
    borderRadius: wp(1.5),
    marginHorizontal: wp(2),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginVertical: hp(2),
  },
});
