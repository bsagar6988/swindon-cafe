export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  OrdersTab: undefined;
  MenuTab: undefined;
  RidersTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  OrderDetail: { orderId: string };
};
