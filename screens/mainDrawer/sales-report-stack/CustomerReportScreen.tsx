import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { CustomerReportScreenProp } from "../../../types/type";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Button } from "@rneui/base";
import Entypo from "@expo/vector-icons/Entypo";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { deleteSalesReportData } from "../../../methods/data-methods/deleteSalesReportData";
import { useSalesReportContext } from "../../../context/SalesReportContext";
import { useProductContext } from "../../../context/ProductContext";
import { useSelectedProductInEditContext } from "../../../context/SelectedProductInEditContext";
import Toast from "react-native-toast-message";
import { useUserContext } from "../../../context/UserContext";
import { useToastContext } from "../../../context/ToastContext";
import InvoiceInfo from "../../../components/InvoiceInfo";
import InvoiceProductsInfo from "../../../components/InvoiceProductsInfo";

const CustomerReportScreen = ({
  route,
  navigation,
}: CustomerReportScreenProp) => {
  const params = route.params;
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false);
  const { salesReports, setSalesReportList } = useSalesReportContext();
  const { products } = useProductContext();
  const { setSelectedProductListInEdit } = useSelectedProductInEditContext();
  const { user } = useUserContext();
  const { showToast } = useToastContext();

  return (
    <View
      style={[
        styles.container,
        { opacity: isConfirmationModalVisible ? 0.1 : 1 },
      ]}
    >
      <InvoiceInfo params={params} />
      <InvoiceProductsInfo params={params} />
      <View style={styles.buttonContainer}>
        <Button
          icon={<Entypo name="trash" size={24} color="#F3F0E9" />}
          buttonStyle={styles.buttonStyle}
          onPress={() => setIsConfirmationModalVisible(true)}
        />
        {params.fromSales && (
          <Button
            icon={<Entypo name="edit" size={24} color="#F3F0E9" />}
            buttonStyle={styles.buttonStyle}
            onPress={() => {
              navigation.navigate("EditCustomerReportTabScreen", params);
              setSelectedProductListInEdit(
                params.selectedProducts.map((selectedProduct) => {
                  const productInCurrentList = products.find(
                    (product) => product.id === selectedProduct.id
                  );
                  return productInCurrentList
                    ? {
                        ...selectedProduct,
                        stock:
                          selectedProduct.quantity + productInCurrentList.stock,
                      }
                    : selectedProduct;
                })
              );
            }}
          />
        )}
      </View>
      <Toast position="bottom" autoHide visibilityTime={2000} />
      <ConfirmationModal
        isVisible={isConfirmationModalVisible}
        setIsVisible={setIsConfirmationModalVisible}
        cancelFn={() => setIsConfirmationModalVisible(false)}
        confirmFn={() => {
          deleteSalesReportData(
            params.id,
            salesReports,
            setSalesReportList,
            products,
            showToast,
            user
          );
          setIsConfirmationModalVisible(false);
        }}
        confirmationTitle="Delete this report?"
        confirmationDescription={`Delete purchase info of ${params.customer?.customerName}`}
      />
    </View>
  );
};

export default CustomerReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0E9",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
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
