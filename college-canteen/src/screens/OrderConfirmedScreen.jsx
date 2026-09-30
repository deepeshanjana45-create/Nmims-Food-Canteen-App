
// src/screens/OrderConfirmedScreen.jsx
// Order Confirmed Screen for NMIMS Canteen App

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const DARK_THEME = {
  bg: '#12131C',
  cardBg: '#1C1E2D',
  cardBorder: 'rgba(255,255,255,0.08)',
  primaryRed: '#FF4D4D',
  white: '#FFFFFF',
  textMuted: '#94A3B8',
  textSub: '#CBD5E1',
  success: '#10B981',
};

export default function OrderConfirmedScreen({ route, navigation }) {
  // Get order data safely
  const order = route?.params?.order || {};

  const orderNumber = order.orderNumber || '#NMIMS1047';
  const amountPaid = order.totalAmount || 70;
  const paymentStatus = order.paymentStatus || 'paid';
  const orderStatus = order.orderStatus || 'preparing';
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={DARK_THEME.bg}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Celebration Header */}
        <View style={styles.celebrationCard}>
          <View style={styles.successIconCircle}>
            <Text style={styles.successCheck}>✓</Text>
          </View>

          <Text style={styles.confTitle}>
            🎉 Order Confirmed!
          </Text>

          <Text style={styles.confSub}>
            Thank you for ordering! Your food is being prepared
            at NMIMS Canteen.
          </Text>
        </View>

        {/* Order Details Card */}
        <View style={styles.detailsCard}>
          {/* Order Number */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Order No.
            </Text>

            <Text style={styles.orderNumberText}>
              {orderNumber}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Amount */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Amount Paid
            </Text>

            <Text style={styles.amountText}>
              ₹{amountPaid}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Payment Status */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Payment Status
            </Text>

            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>
                ✓ PAID
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Order Status */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Order Status
            </Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                ⏳ {String(orderStatus).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Ordered Items */}
        {items.length > 0 && (
          <View style={styles.itemsCard}>
            <Text style={styles.itemsTitle}>
              Items Ordered
            </Text>

            {items.map((item, index) => {
              const food = item?.food || {};
              const quantity = item?.quantity || 1;
              const price = Number(food?.price || 0);

              return (
                <View
                  key={food?.id || food?._id || index}
                  style={styles.itemRow}
                >
                  <Text style={styles.itemEmoji}>
                    {food?.emoji || '🍽️'}
                  </Text>

                  <Text style={styles.itemName}>
                    {food?.name || 'Food Item'}
                  </Text>

                  <Text style={styles.itemQty}>
                    ×{quantity}
                  </Text>

                  <Text style={styles.itemPrice}>
                    ₹{price * quantity}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Preparing Message */}
        <View style={styles.messageCard}>
          <Text style={styles.messageEmoji}>
            👨‍🍳
          </Text>

          <View style={styles.messageContent}>
            <Text style={styles.messageTitle}>
              Your food is being prepared
            </Text>

            <Text style={styles.messageText}>
              We'll notify you when your order is ready.
              Please collect it from the canteen counter.
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.btnStack}>
          {/* View Order */}
          <TouchableOpacity
            style={styles.redViewOrderBtn}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('OrdersTab')}
          >
            <Text style={styles.redViewOrderText}>
              View Order 📋
            </Text>
          </TouchableOpacity>

          {/* Home */}
          <TouchableOpacity
            style={styles.whiteHomeBtn}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.whiteHomeText}>
              Back to Home 🏠
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DARK_THEME.bg,
  },

  content: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },

  // Celebration Header
  celebrationCard: {
    backgroundColor: DARK_THEME.cardBg,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
    marginBottom: 16,
  },

  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: DARK_THEME.success,
  },

  successCheck: {
    fontSize: 34,
    color: DARK_THEME.success,
    fontWeight: '900',
  },

  confTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: DARK_THEME.white,
    marginBottom: 8,
    textAlign: 'center',
  },

  confSub: {
    fontSize: 13,
    lineHeight: 20,
    color: DARK_THEME.textMuted,
    textAlign: 'center',
  },

  // Order Details
  detailsCard: {
    backgroundColor: DARK_THEME.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
    marginBottom: 16,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 32,
  },

  detailLabel: {
    fontSize: 13,
    color: DARK_THEME.textMuted,
    fontWeight: '500',
  },

  orderNumberText: {
    fontSize: 18,
    fontWeight: '900',
    color: DARK_THEME.primaryRed,
  },

  amountText: {
    fontSize: 18,
    fontWeight: '900',
    color: DARK_THEME.white,
  },

  divider: {
    height: 1,
    backgroundColor: DARK_THEME.cardBorder,
    marginVertical: 10,
  },

  // Paid Badge
  paidBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 10,
  },

  paidBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: DARK_THEME.success,
  },

  // Status Badge
  statusBadge: {
    backgroundColor: 'rgba(255, 77, 77, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 10,
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: DARK_THEME.primaryRed,
  },

  // Items
  itemsCard: {
    backgroundColor: DARK_THEME.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
    marginBottom: 16,
  },

  itemsTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: DARK_THEME.white,
    marginBottom: 12,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.cardBorder,
  },

  itemEmoji: {
    fontSize: 18,
    width: 28,
  },

  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: DARK_THEME.white,
    flex: 1,
    marginLeft: 8,
  },

  itemQty: {
    fontSize: 13,
    color: DARK_THEME.textMuted,
    marginRight: 14,
  },

  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: DARK_THEME.white,
    minWidth: 50,
    textAlign: 'right',
  },

  // Preparing Message
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.08)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.18)',
    marginBottom: 18,
  },

  messageEmoji: {
    fontSize: 34,
    marginRight: 14,
  },

  messageContent: {
    flex: 1,
  },

  messageTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: DARK_THEME.white,
    marginBottom: 4,
  },

  messageText: {
    fontSize: 12,
    lineHeight: 18,
    color: DARK_THEME.textMuted,
  },

  // Buttons
  btnStack: {
    marginTop: 2,
  },

  redViewOrderBtn: {
    backgroundColor: DARK_THEME.primaryRed,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  redViewOrderText: {
    color: DARK_THEME.white,
    fontSize: 16,
    fontWeight: '900',
  },

  whiteHomeBtn: {
    backgroundColor: DARK_THEME.white,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  whiteHomeText: {
    color: DARK_THEME.bg,
    fontSize: 16,
    fontWeight: '900',
  },

  bottomSpace: {
    height: 20,
  },
});
