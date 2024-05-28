export type RootStackParamList = {
  SignUpScreen: undefined;
  LogInScreen: undefined;
  HomeScreen: undefined;
  Settings: undefined;
  VerifyEmailScreen: String;
  ForgotPasswordScreen: Boolean;
  SplashScreen: undefined;
};

export type RootTabParamList = {
  POS: undefined;
  Customers: undefined;
  Reports: undefined;
  Products: undefined;
};

export type ProductRootStackParamList = {
  AddProductScreen: undefined;
  ProductScreen: undefined;
  ConfigureProductScreen: { item: Product };
};

export type CustomerRootStackParamList = {
  CustomerScreen: undefined;
  AddCustomerScreen: undefined;
  ConfigureCustomerScreen: { item: Customer };
};

export type PosRootStackParamList = {
  PosScreen: undefined;
  AddReportScreen: { product: Product; quantity: Number }[];
};

export type ReportRootStackParamList = {
  ReportScreen: undefined;
  SalesReportScreen: undefined;
  Expenses: undefined;
  StockReportScreen: undefined;
  SummaryCustomerReportScreen: PosReport;
  LowStockReportScreen: undefined;
};

export type ExpenseRootStackParamList = {
  ExpenseReportScreen: undefined;
  AddExpenseScreen: undefined;
  ViewExpenseSummaryScreen: ExpenseReport;
};

export type Product = {
  id: String;
  productName: String;
  stockPrice: number;
  sellPrice: number;
  stock: number;
  totalStockSold: number;
};

export type Customer = {
  id: String;
  customerName: String;
  customerInfo: String;
};

export type PosReport = {
  id: String;
  customer: Customer | undefined;
  customerPayment: Number;
  productList: {
    product: {
      id: String;
      productName: String;
      stockPrice: number;
      sellPrice: number;
    };
    quantity: Number;
  }[];
  date: Date | string;
  otherExpense: Number;
  dogTreatDiscount: Number;
  catTreatDiscount: Number;
  gateDiscount: Number;
};

export type ExpenseReport = {
  id: String;
  expenseTitle: String;
  expenseDescription: String;
  expenseDate: Date | string;
  expenseCost: Number;
};
