import type { NavigatorScreenParams } from "@react-navigation/native";
import type { MenuItem } from "@restaurant/shared";
import type { LegalPageKey } from "../legalContent";

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
  RestaurantMenu: { restaurantId: string };
  ItemDetail: { item: MenuItem; restaurantId: string };
  Checkout: undefined;
  OrderTracking: { orderId: string };
  AddressBook: undefined;
  About: undefined;
  LegalHelp: undefined;
  StaticContent: { pageKey: LegalPageKey };
};
