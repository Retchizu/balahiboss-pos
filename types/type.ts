import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type AuthStackParamList = {
  SplashScreen: undefined;
  SignInScreen: undefined;
};

export type POSTabParamList = {
  ProductScreen: undefined;
  PreviewScreen: undefined;
  RecentStackScreen: undefined;
  InvoiceStackScreen: undefined;
};

export type DrawerParamList = {
  POSScreen: undefined;
  ProductStackScreen: undefined;
  CustomerStackScreen: undefined;
  SalesReportStackScreen: undefined;
  StockReportScreen: undefined;
  LowStockReportScreen: undefined;
};

export type CustomerStackParamList = {
  AddCustomerScreen: Boolean;
  CustomerInfoScreen: Customer;
  CustomerListScreen: undefined;
  EditCustomerScreen: Customer;
};

export type ProductStackParamList = {
  AddProductScreen: undefined;
  EditProductScreen: Product;
  ProductListScreen: undefined;
  ProductInfoScreen: Product;
};

export type InvoiceStackParamList = {
  InvoiceScreen: Customer;
  AddCustomerScreen: Boolean;
};

export type RecentStackParamList = {
  RecentScreen: undefined;
  CustomerReportScreen: CustomerReportParams & { fromSales: boolean };
};

export type CustomerReportParams = {
  id: string;
  cashPayment: string;
  onlinePayment: string;
  customer: Customer | null;
  date: string | null;
  discount: string;
  freebies: string;
  deliveryFee: string;
  selectedProducts: SelectedProduct[];
};

export type EditCustomerReportTabParamList = {
  EditCustomerReportScreen: CustomerReportParams;
  PreviewEditCustomerReportScreen: CustomerReportParams;
  ProductListEditCustomerReportScreen: CustomerReportParams;
};

export type SalesReportStackParamList = {
  SalesReportScreen: undefined;
  CustomerReportScreen: CustomerReportParams & { fromSales: boolean };
  EditCustomerReportTabScreen: CustomerReportParams;
};

export type Product = {
  id: string;
  productName: string;
  stockPrice: number;
  sellPrice: number;
  stock: number;
  lowStockThreshold: number;
};

export type SelectedProduct = Product & {
  quantity: number;
};

export type Customer = {
  id: string;
  customerName: string;
  customerInfo: string;
};

export type InvoiceForm = {
  cashPayment: string;
  onlinePayment: string;
  customer: Customer | null;
  date: Date | null;
  discount: string;
  freebies: string;
  deliveryFee: string;
};

export type SalesReport = {
  id: string;
  selectedProduct: SelectedProduct[];
  invoiceForm: InvoiceForm;
};

export type SplashScreenProp = NativeStackScreenProps<
  AuthStackParamList,
  "SplashScreen"
>;

export type SignInScreenProp = NativeStackScreenProps<
  AuthStackParamList,
  "SignInScreen"
>;

export type CustomerListScreenProp = NativeStackScreenProps<
  CustomerStackParamList,
  "CustomerListScreen"
>;

export type CustomerInfoScreenProp = NativeStackScreenProps<
  CustomerStackParamList,
  "CustomerInfoScreen"
>;
export type EditCustomerScreenProp = NativeStackScreenProps<
  CustomerStackParamList,
  "EditCustomerScreen"
>;

export type ProductListScreenProp = NativeStackScreenProps<
  ProductStackParamList,
  "ProductListScreen"
>;

export type ProductInfoScreenProp = NativeStackScreenProps<
  ProductStackParamList,
  "ProductInfoScreen"
>;
export type EditProductInfoScreenProp = NativeStackScreenProps<
  ProductStackParamList,
  "EditProductScreen"
>;

export type InvoiceScreenProp = NativeStackScreenProps<
  InvoiceStackParamList,
  "InvoiceScreen"
>;

export type AddCustomerScreenProp = NativeStackScreenProps<
  InvoiceStackParamList,
  "AddCustomerScreen"
>;

export type SalesReportListScreenProp = NativeStackScreenProps<
  SalesReportStackParamList,
  "SalesReportScreen"
>;
export type CustomerReportScreenProp = NativeStackScreenProps<
  SalesReportStackParamList,
  "CustomerReportScreen"
>;
export type RecentScreenProp = NativeStackScreenProps<
  RecentStackParamList,
  "RecentScreen"
>;

export type EditCustomerReportScreenProp = BottomTabScreenProps<
  EditCustomerReportTabParamList,
  "EditCustomerReportScreen"
>;
/* export type ProductListEditCustomerReportScreenProp = BottomTabScreenProps<
  EditCustomerReportTabParamList,
  "ProductListEditCustomerReportScreen"
>;
 */
export type EditCustomerReportTabScreenProp = {
  route: {
    params: CustomerReportParams;
  };
};
