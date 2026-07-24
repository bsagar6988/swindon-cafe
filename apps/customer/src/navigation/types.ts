import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  ItemDetail: { itemId: string };
  Checkout: undefined;
  OrderTracking: { orderId: string };
  AddressBook: undefined;
};
