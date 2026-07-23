export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  AvailableTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  ActiveDelivery: { orderId: string };
};
