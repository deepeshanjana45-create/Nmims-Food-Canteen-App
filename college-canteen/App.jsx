// App.jsx — Root of NMIMS Canteen Student Portal app
// Navigation: Bottom tabs (Home, Menu, Cart, Orders, Profile)
// Stack navigators for Home, Menu, and Cart

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { CartProvider, useCart } from './src/context/CartContext';
import { AuthProvider } from './src/context/AuthContext';
import LoginModal from './src/components/LoginModal';
import HomeScreen from './src/screens/HomeScreen';
import MenuScreen from './src/screens/MenuScreen';
import FoodListingScreen from './src/screens/FoodListingScreen';
import FoodDetailScreen from './src/screens/FoodDetailScreen';
import CartScreen from './src/screens/CartScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import OrderConfirmedScreen from './src/screens/OrderConfirmedScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const THEME = {
  primary: '#FF4D4D',
  primaryDark: '#12131C',
  bg: '#12131C',
  card: '#1C1E2D',
  text: '#FFFFFF',
  textSub: '#94A3B8',
  accent: '#FF4D4D',
};

// --- Home stack (Home + FoodDetail) ---
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="FoodListing" component={FoodListingScreen} />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
    </Stack.Navigator>
  );
}

// --- Menu stack (Menu + FoodListing + FoodDetail) ---
function MenuStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="FoodListing" component={FoodListingScreen} />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
    </Stack.Navigator>
  );
}

// --- Cart stack (Cart + Payment + OrderConfirmed + FoodDetail) ---
function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="OrderConfirmed" component={OrderConfirmedScreen} />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
    </Stack.Navigator>
  );
}

// --- Custom tab bar icon ---
function TabIcon({ emoji, label, focused, badgeCount }) {
  return (
    <View style={tabStyles.iconWrap}>
      <Text style={[tabStyles.emoji, focused && tabStyles.emojiActive]}>
        {emoji}
      </Text>

      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
        {label}
      </Text>

      {badgeCount > 0 && (
        <View style={tabStyles.badge}>
          <Text style={tabStyles.badgeText}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
}

// --- Main tabs ---
function MainTabs() {
  const { cartCount } = useCart();

  // Get Android/iOS safe-area values
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        // Fix bottom navigation overlap with Android system navigation area
        tabBarStyle: [
          tabStyles.bar,
          {
            height: 68 + insets.bottom,
            paddingBottom: insets.bottom + 8,
          },
        ],
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="🏠"
              label="Home"
              focused={focused}
            />
          ),
        }}
      />

      <Tab.Screen
        name="CategoriesTab"
        component={MenuStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="🍽️"
              label="Menu"
              focused={focused}
            />
          ),
        }}
      />

      <Tab.Screen
        name="CartTab"
        component={CartStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="🛒"
              label="Cart"
              focused={focused}
              badgeCount={cartCount}
            />
          ),
        }}
      />

      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="📋"
              label="Orders"
              focused={focused}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="👤"
              label="Profile"
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// --- App root ---
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <StatusBar style="light" />

            <MainTabs />

            <LoginModal />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// --- Bottom tab styles ---
const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: THEME.card,

    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',

    height: 68,

    paddingTop: 6,

    elevation: 12,
  },

  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 2,
  },

  emoji: {
    fontSize: 22,
    opacity: 0.45,
  },

  emojiActive: {
    opacity: 1,
  },

  label: {
    fontSize: 10,
    color: THEME.textSub,
    marginTop: 3,
    fontWeight: '500',
  },

  labelActive: {
    color: THEME.primary,
    fontWeight: '900',
  },

  badge: {
    position: 'absolute',
    top: -2,
    right: -8,

    backgroundColor: THEME.accent,

    borderRadius: 9,

    minWidth: 18,
    height: 18,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 3,

    borderWidth: 1.5,
    borderColor: THEME.card,
  },

  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
});