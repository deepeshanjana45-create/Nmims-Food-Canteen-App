// src/screens/CartScreen.jsx — Redesigned Cart Screen (No Platform Fee)

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const RED_THEME = {
  primaryRed: '#DC2626',
  primaryRedDark: '#B91C1C',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  textDark: '#0F172A',
  textSub: '#64748B',
  border: '#E2E8F0',
  success: '#16A34A',
  badgeBg: '#FEE2E2',
};

export default function CartScreen({ navigation }) {
  const { items, cartTotal, cartCount, increment, decrement, removeItem, clearCart, placeOrder } = useCart();
  const { requireAuth } = useAuth();

  const handleProceedToPayment = () => {
    if (items.length === 0) return;

    requireAuth(() => {
      navigation.navigate('Payment', {
        cartItems: items,
        totalAmount: cartTotal,
      });
    }, 'Please log in to proceed to payment');
  };

  // Empty Cart View
  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={RED_THEME.primaryRed} />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Your Cart</Text>
              <Text style={styles.headerSub}>0 items</Text>
            </View>
          </View>
        </View>

        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptyDesc}>Add some delicious canteen meals to get started!</Text>
          <TouchableOpacity
            style={styles.redBrowseBtn}
            onPress={() => navigation.navigate('CategoriesTab')}
          >
            <Text style={styles.redBrowseBtnText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={RED_THEME.primaryRed} />

      {/* Header (Vibrant Red Matching Screenshot) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <Text style={styles.headerSub}>{cartCount} item{cartCount > 1 ? 's' : ''}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.clearAllBtn} onPress={clearCart}>
          <Text style={styles.clearAllIcon}>🗑</Text>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {/* Cart Item Cards (Matching Screenshot Layout) */}
        {items.map(({ food, quantity }) => (
          <View key={food.id} style={styles.cartCard}>
            {/* Food Image */}
            <View style={styles.imgWrap}>
              {food.image ? (
                <Image source={{ uri: food.image }} style={styles.foodImg} resizeMode="cover" />
              ) : (
                <View style={styles.emojiFallback}>
                  <Text style={styles.emojiText}>{food.emoji || '🍽️'}</Text>
                </View>
              )}
            </View>

            {/* Food Details */}
            <View style={styles.cardInfo}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodPriceEach}>₹{food.price} each</Text>
              
              <View style={styles.vegBadgeRow}>
                <View style={styles.vegSymbol}>
                  <View style={styles.vegSymbolDot} />
                </View>
                <Text style={styles.vegBadgeText}>Pure Veg</Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total: </Text>
                <Text style={styles.totalValue}>₹{food.price * quantity}</Text>
              </View>
            </View>

            {/* Right Side: Quantity Controller & Remove Link */}
            <View style={styles.cardRight}>
              <View style={styles.qtyControl}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => decrement(food.id)}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyNum}>{quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => increment(food.id)}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(food.id)}>
                <Text style={styles.removeIcon}>🗑</Text>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Bill Details Breakdown Card */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Details</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item total</Text>
            <Text style={styles.billVal}>₹{cartTotal}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery</Text>
            <Text style={[styles.billVal, styles.freeDeliveryText]}>FREE 🎉</Text>
          </View>

          <View style={styles.billDivider} />

          <View style={styles.billRow}>
            <Text style={styles.billGrandTitle}>Grand Total</Text>
            <Text style={styles.billGrandVal}>₹{cartTotal}</Text>
          </View>
        </View>

        {/* Student Discount Soft Red Banner */}
        <View style={styles.studentBanner}>
          <Text style={styles.studentBannerText}>
            🎓 Student pricing applied - Free campus delivery
          </Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerLabel}>Total payable</Text>
          <Text style={styles.footerPrice}>₹{cartTotal}</Text>
        </View>

        <TouchableOpacity
          style={styles.redPlaceOrderBtn}
          activeOpacity={0.88}
          onPress={handleProceedToPayment}
        >
          <Text style={styles.redPlaceOrderText}>Proceed to Payment →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: RED_THEME.bg,
  },

  // Header (Vibrant Red)
  header: {
    backgroundColor: RED_THEME.primaryRed,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  clearAllIcon: {
    fontSize: 12,
    color: '#FFF',
  },
  clearAllText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Empty State
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: RED_THEME.textDark,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: RED_THEME.textSub,
    textAlign: 'center',
    marginBottom: 24,
  },
  redBrowseBtn: {
    backgroundColor: RED_THEME.primaryRed,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 20,
    shadowColor: RED_THEME.primaryRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  redBrowseBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
  },

  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  // Cart Item Card
  cartCard: {
    backgroundColor: RED_THEME.card,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: RED_THEME.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imgWrap: {
    width: 70,
    height: 70,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  foodImg: {
    width: '100%',
    height: '100%',
  },
  emojiFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },
  emojiText: {
    fontSize: 32,
  },

  cardInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '900',
    color: RED_THEME.textDark,
    marginBottom: 2,
  },
  foodPriceEach: {
    fontSize: 12,
    color: RED_THEME.textSub,
    marginBottom: 4,
  },
  vegBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  vegSymbol: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: RED_THEME.success,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegSymbolDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: RED_THEME.success,
  },
  vegBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: RED_THEME.success,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: 12,
    color: RED_THEME.textSub,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '900',
    color: RED_THEME.primaryRed,
  },

  // Quantity & Remove Right Column
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: RED_THEME.border,
  },
  qtyBtn: {
    backgroundColor: RED_THEME.primaryRed,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  qtyNum: {
    width: 26,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '900',
    color: RED_THEME.textDark,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingTop: 4,
  },
  removeIcon: {
    fontSize: 12,
    color: RED_THEME.primaryRed,
  },
  removeText: {
    fontSize: 11,
    color: RED_THEME.primaryRed,
    fontWeight: '700',
  },

  // Bill Breakdown Card
  billCard: {
    backgroundColor: RED_THEME.card,
    borderRadius: 20,
    padding: 16,
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: RED_THEME.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: RED_THEME.textDark,
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 13,
    color: RED_THEME.textSub,
    fontWeight: '500',
  },
  billVal: {
    fontSize: 14,
    fontWeight: '800',
    color: RED_THEME.textDark,
  },
  freeDeliveryText: {
    color: RED_THEME.success,
    fontWeight: '900',
  },
  billDivider: {
    height: 1,
    backgroundColor: RED_THEME.border,
    marginVertical: 10,
  },
  billGrandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: RED_THEME.textDark,
  },
  billGrandVal: {
    fontSize: 22,
    fontWeight: '900',
    color: RED_THEME.primaryRed,
  },

  // Student Banner
  studentBanner: {
    backgroundColor: RED_THEME.badgeBg,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  studentBannerText: {
    fontSize: 12,
    color: RED_THEME.primaryRed,
    fontWeight: '800',
    textAlign: 'center',
  },

  // Sticky Bottom Bar
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: RED_THEME.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  footerLeft: {},
  footerLabel: {
    fontSize: 11,
    color: RED_THEME.textSub,
    fontWeight: '500',
  },
  footerPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: RED_THEME.textDark,
  },
  redPlaceOrderBtn: {
    backgroundColor: RED_THEME.primaryRed,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 18,
    shadowColor: RED_THEME.primaryRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  redPlaceOrderText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
