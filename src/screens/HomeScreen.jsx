// src/screens/HomeScreen.jsx — Clean Front Page with Centered NMIMS Logo & Sleek Dark Background

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DARK_THEME = {
  bg: '#0F111E',
  cardBg: '#1C1E2D',
  primaryRed: '#FF4D4D',
  white: '#FFFFFF',
  textMuted: '#94A3B8',
  textSub: '#CBD5E1',
  border: 'rgba(255, 255, 255, 0.1)',
};

export default function HomeScreen({ navigation }) {
  const { cartCount, cartTotal } = useCart();
  const { isLoggedIn, user, openLoginModal, logout } = useAuth();

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_THEME.bg} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar: Campus Badge & Login/Profile Action */}
        <View style={styles.topBar}>
          <View style={styles.campusBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.campusBadgeText}>NMIMS INDORE CAMPUS</Text>
          </View>

          <View style={styles.topRightActions}>
            {!isLoggedIn ? (
              <TouchableOpacity
                style={styles.topLoginBtn}
                onPress={() => openLoginModal('Log in to your NMIMS account')}
              >
                <Text style={styles.topLoginBtnText}>Log In 🔑</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.userBadge} onPress={logout}>
                <Text style={styles.userBadgeText}>👤 {user?.name?.split(' ')[0]}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.topCartBtn}
              onPress={() => navigation.navigate('CartTab')}
            >
              <Text style={styles.cartIcon}>🛒</Text>
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Centered Branding & Logo Section */}
        <View style={styles.centerSection}>
          {/* Prominent Centered White Circular Logo Frame */}
          <View style={styles.logoCircle}>
            <Image
              source={require('../../assets/nmims-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.brandTitle}>NMIMS Canteen</Text>
          <Text style={styles.brandSub}>SVKM's NMIMS Deemed-to-be University</Text>

          {/* Quote Box */}
          <View style={styles.quoteBox}>
            <Text style={styles.goodLineText}>✨ "Good Meals, Good Day" ✨</Text>
            <Text style={styles.taglineText}>Freshly prepared meals for energy & focus</Text>
          </View>

          {/* Stacked Pill Action Buttons */}
          <View style={styles.buttonStack}>
            {/* Red Pill Button — Order Food */}
            <TouchableOpacity
              style={styles.redOrderBtn}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('CategoriesTab')}
            >
              <Text style={styles.redOrderBtnText}>Order Food 🍽️</Text>
            </TouchableOpacity>

            {/* White Pill Button — View Cart / Student Login */}
            {!isLoggedIn ? (
              <TouchableOpacity
                style={styles.whiteCartBtn}
                activeOpacity={0.88}
                onPress={() => openLoginModal('Log in to view your orders')}
              >
                <Text style={styles.whiteCartBtnText}>Student Login 👤</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.whiteCartBtn}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('CartTab')}
              >
                <Text style={styles.whiteCartBtnText}>
                  View Cart {cartCount > 0 ? `(₹${cartTotal})` : '🛒'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Footer Tagline */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            🎓 Official SVKM's NMIMS Canteen Portal • Pure Veg & Fresh Meals
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DARK_THEME.bg,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  campusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_THEME.cardBg,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  campusBadgeText: {
    color: DARK_THEME.textSub,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topLoginBtn: {
    backgroundColor: DARK_THEME.primaryRed,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  topLoginBtnText: {
    color: DARK_THEME.white,
    fontSize: 12,
    fontWeight: '900',
  },
  userBadge: {
    backgroundColor: DARK_THEME.cardBg,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
  userBadgeText: {
    color: DARK_THEME.white,
    fontSize: 11,
    fontWeight: '800',
  },

  topCartBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DARK_THEME.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DARK_THEME.border,
    position: 'relative',
  },
  cartIcon: {
    fontSize: 16,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: DARK_THEME.primaryRed,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: DARK_THEME.bg,
  },
  cartBadgeText: {
    color: DARK_THEME.white,
    fontSize: 10,
    fontWeight: '900',
  },

  // Center Section
  centerSection: {
    alignItems: 'center',
    marginVertical: 24,
  },

  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DARK_THEME.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    marginBottom: 20,
    shadowColor: DARK_THEME.primaryRed,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoImage: {
    width: '85%',
    height: '85%',
  },

  brandTitle: {
    color: DARK_THEME.white,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  brandSub: {
    color: DARK_THEME.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 28,
    textAlign: 'center',
  },

  quoteBox: {
    alignItems: 'center',
    backgroundColor: DARK_THEME.cardBg,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DARK_THEME.border,
    marginBottom: 32,
    width: '100%',
  },
  goodLineText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
    marginBottom: 4,
    textAlign: 'center',
  },
  taglineText: {
    color: DARK_THEME.textSub,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Button Stack
  buttonStack: {
    width: '100%',
    gap: 14,
  },

  redOrderBtn: {
    backgroundColor: DARK_THEME.primaryRed,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DARK_THEME.primaryRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  redOrderBtnText: {
    color: DARK_THEME.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  whiteCartBtn: {
    backgroundColor: DARK_THEME.white,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  whiteCartBtnText: {
    color: DARK_THEME.bg,
    fontSize: 16,
    fontWeight: '900',
  },

  // Footer Note
  footerNote: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerNoteText: {
    color: DARK_THEME.textMuted,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
});
