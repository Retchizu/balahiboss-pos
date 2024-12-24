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
  DraftStackScreen: undefined;
};

export type CustomerStackParamList = {
  AddCustomerScreen: Boolean;
  CustomerInfoScreen: undefined;
  CustomerListScreen: undefined;
  EditCustomerScreen: undefined;
};

export type ProductStackParamList = {
  AddProductScreen: undefined;
  EditProductScreen: undefined;
  ProductListScreen: undefined;
  ProductInfoScreen: undefined;
};

export type InvoiceStackParamList = {
  InvoiceScreen: Customer;
  AddCustomerScreen: Boolean;
};

export type RecentStackParamList = {
  RecentScreen: undefined;
  CustomerReportScreen: undefined;
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

export type DraftInfoParams = {
  id: string;
  draftTitle: string;
  selectedProduct: SelectedProduct[];
  invoiceForm: {
    cashPayment: string;
    onlinePayment: string;
    customer: Customer | null;
    date: string | null;
    discount: string;
    freebies: string;
    deliveryFee: string;
  };
  createdAt: string;
};

export type EditCustomerReportTabParamList = {
  EditCustomerReportScreen: undefined;
  PreviewEditCustomerReportScreen: undefined;
  ProductListEditCustomerReportScreen: undefined;
};

export type SalesReportStackParamList = {
  SalesReportScreen: undefined;
  CustomerReportScreen: undefined;
  EditCustomerReportTabScreen: undefined;
};

export type DraftStackParamList = {
  DraftScreen: undefined;
  DraftInfoScreen: DraftInfoParams;
  POSScreen: { screen: string };
};

export type User = {
  uid: string;
  email: string;
  displayName: string;
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

export type InvoiceDraft = {
  id: string;
  draftTitle: string;
  selectedProduct: SelectedProduct[];
  invoiceForm: InvoiceForm;
  createdAt: Date;
};

export type Device = {
  address: string;
  name: string;
};

export type ProductInfoType = {
  productName: string;
  stockPrice: string;
  sellPrice: string;
  lowStockThreshold: string;
  buyStock: string;
  editStock: string;
};
export type choiceType = { key: number; choiceName: string };
export type SplashScreenProp = NativeStackScreenProps<
  AuthStackParamList,
  "SplashScreen"
>;

export type SignInScreenProp = NativeStackScreenProps<
  AuthStackParamList,
  "SignInScreen"
>;

export type DraftScreenProp = NativeStackScreenProps<
  DraftStackParamList,
  "DraftScreen"
>;

export type DraftInfoScreenProp = NativeStackScreenProps<
  DraftStackParamList,
  "DraftInfoScreen"
>;

export type CustomerListScreenProp = NativeStackScreenProps<
  CustomerStackParamList,
  "CustomerListScreen"
>;

export type CustomerInfoScreenProp = NativeStackScreenProps<
  CustomerStackParamList,
  "CustomerInfoScreen"
>;
export type ProductListScreenProp = NativeStackScreenProps<
  ProductStackParamList,
  "ProductListScreen"
>;

export type ProductInfoScreenProp = NativeStackScreenProps<
  ProductStackParamList,
  "ProductInfoScreen"
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
