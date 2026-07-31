import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@restaurant/shared";
import { useAuth } from "../context/AuthContext";
import { CartProvider, useCart } from "../context/CartContext";
import { LoginScreen } from "../screens/LoginScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { RestaurantListScreen } from "../screens/RestaurantListScreen";
import { RestaurantMenuScreen } from "../screens/RestaurantMenuScreen";
import { ItemDetailScreen } from "../screens/ItemDetailScreen";
import { CartScreen } from "../screens/CartScreen";
import { CheckoutScreen } from "../screens/CheckoutScreen";
import { OrderHistoryScreen } from "../screens/OrderHistoryScreen";
import { OrderTrackingScreen } from "../screens/OrderTrackingScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { AddressBookScreen } from "../screens/AddressBookScreen";
import { AboutScreen } from "../screens/AboutScreen";
import { LegalHelpScreen } from "../screens/LegalHelpScreen";
import { StaticContentScreen } from "../screens/StaticContentScreen";
import type { AuthStackParamList, MainTabParamList, RootStackParamList } from "./types";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function CartTabIcon({ color, size }: { color: string; size: number }) {
  const { totalQuantity } = useCart();
  return (
    <View>
      <Ionicons name="cart-outline" size={size} color={color} />
      {totalQuantity > 0 && (
        <View
          style={{
            position: "absolute",
            top: -4,
            right: -8,
            backgroundColor: theme.colors.primary,
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 3,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>{totalQuantity}</Text>
        </View>
      )}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={RestaurantListScreen}
        options={{
          title: "Restaurants",
          tabBarIcon: ({ color, size }) => <Ionicons name="restaurant-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: "Cart",
          tabBarIcon: CartTabIcon,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrderHistoryScreen}
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  return (
    <CartProvider>
      <RootStack.Navigator>
        <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <RootStack.Screen
          name="RestaurantMenu"
          component={RestaurantMenuScreen}
          options={{ title: "" }}
        />
        <RootStack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: "" }} />
        <RootStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
        <RootStack.Screen
          name="OrderTracking"
          component={OrderTrackingScreen}
          options={{ title: "Track order", headerBackVisible: false }}
        />
        <RootStack.Screen
          name="AddressBook"
          component={AddressBookScreen}
          options={{ title: "Manage addresses" }}
        />
        <RootStack.Screen name="About" component={AboutScreen} options={{ title: "About us" }} />
        <RootStack.Screen
          name="LegalHelp"
          component={LegalHelpScreen}
          options={{ title: "Legal & Help" }}
        />
        <RootStack.Screen
          name="StaticContent"
          component={StaticContentScreen}
          options={{ title: "" }}
        />
      </RootStack.Navigator>
    </CartProvider>
  );
}

export function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>{user ? <MainNavigator /> : <AuthNavigator />}</NavigationContainer>
  );
}
