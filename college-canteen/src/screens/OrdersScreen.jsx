// OrdersScreen.jsx — Order history with status tracker

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useCart } from '../context/CartContext';

const THEME = {
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  primaryLight: '#EDE9FE',
  accent: '#F59E0B',
  bg: '#F5F3FF',
  card: '#FFFFFF',
  text: '#1E1B4B',
  textSub: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  border: '#E5E7EB',
};

const STATUS_STEPS = ['Order Placed', 'Preparing', 'Ready', 'Picked Up'];

function StatusBadge({ status }) {
  const colorMap = {
    Preparing: { bg: '#FEF3C7', text: '#D97706' },
    Ready: { bg: '#D1FAE5', text: '#065F46' },
    'Picked Up': { bg: '#EDE9FE', text: '#5B21B6' },
    'Order Placed': { bg: '#DBEAFE', text: '#1E40AF' },
  };
  const colors = colorMap[status] || { bg: '#F3F4F6', text: '#6B7280' };
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>{status}</Text>
    </View>
  );
}

function ProgressTracker({ status }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <View style={styles.progressRow}>
      {STATUS_STEPS.map((step, idx) => (
        <React.Fragment key={step}>
          <View style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                idx <= currentIdx && styles.progressDotActive,
              ]}
            >
              {idx <= currentIdx && <Text style={styles.progressCheck}>✓</Text>}
            </View>
            <Text
              style={[
                styles.progressLabel,
                idx <= currentIdx && styles.progressLabelActive,
              ]}
              numberOfLines={1}
            >
              {step}
            </Text>
          </View>
          {idx < STATUS_STEPS.length - 1 && (
            <View
              style={[
                styles.progressLine,
                idx < currentIdx && styles.progressLineActive,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

export default function OrdersScreen({ navigation }) {
  const { orders } = useCart();

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primaryDark} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSub}>
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyDesc}>Place your first order from the menu!</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('HomeTab')}>
            <Text style={styles.browseBtnText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              {/* Order header */}
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderDate}>
                    {order.date} · {order.placedAt}
                  </Text>
                </View>
                <StatusBadge status={order.status} />
              </View>

              {/* Progress tracker */}
              <ProgressTracker status={order.status} />

              {/* Items */}
              <View style={styles.itemsSection}>
                <Text style={styles.itemsTitle}>Items ordered</Text>
                {order.items.map(({ food, quantity }) => (
                  <View key={food.id} style={styles.orderItem}>
                    <Text style={styles.orderItemEmoji}>{food.emoji}</Text>
                    <Text style={styles.orderItemName}>{food.name}</Text>
                    <Text style={styles.orderItemQty}>×{quantity}</Text>
                    <Text style={styles.orderItemPrice}>₹{food.price * quantity}</Text>
                  </View>
                ))}
              </View>

              {/* Bill summary */}
              <View style={styles.billRow}>
                <View style={styles.billItem}>
                  <Text style={styles.billLabel}>Subtotal</Text>
                  <Text style={styles.billVal}>₹{order.subtotal}</Text>
                </View>
                <View style={styles.billItem}>
                  <Text style={styles.billLabel}>Fees</Text>
                  <Text style={styles.billVal}>₹20</Text>
                </View>
                <View style={[styles.billItem, styles.billItemTotal]}>
                  <Text style={styles.billTotalLabel}>Total</Text>
                  <Text style={styles.billTotalVal}>₹{order.total}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  header: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '800' },
  headerSub: { color: '#DDD6FE', fontSize: 13, marginTop: 2 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 80, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: THEME.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: THEME.textSub, textAlign: 'center', marginBottom: 24 },
  browseBtn: {
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  browseBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  list: { padding: 16, gap: 16, paddingBottom: 30 },

  orderCard: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  orderId: { fontSize: 15, fontWeight: '800', color: THEME.text },
  orderDate: { fontSize: 12, color: THEME.textSub, marginTop: 2 },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  // Progress tracker
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  progressStep: { alignItems: 'center', flex: 1 },
  progressDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: THEME.border,
    borderWidth: 2,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  progressDotActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  progressCheck: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  progressLabel: {
    fontSize: 9,
    color: THEME.textSub,
    textAlign: 'center',
    maxWidth: 60,
  },
  progressLabelActive: { color: THEME.primary, fontWeight: '700' },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: THEME.border,
    marginTop: 10,
  },
  progressLineActive: { backgroundColor: THEME.primary },

  // Items section
  itemsSection: { marginBottom: 14 },
  itemsTitle: { fontSize: 13, fontWeight: '700', color: THEME.textSub, marginBottom: 8 },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  orderItemEmoji: { fontSize: 20 },
  orderItemName: { flex: 1, fontSize: 13, color: THEME.text, fontWeight: '600' },
  orderItemQty: { fontSize: 12, color: THEME.textSub },
  orderItemPrice: { fontSize: 13, fontWeight: '700', color: THEME.primary, minWidth: 50, textAlign: 'right' },

  // Bill
  billRow: {
    flexDirection: 'row',
    backgroundColor: THEME.primaryLight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  billItem: { flex: 1, alignItems: 'center', padding: 10 },
  billItemTotal: { backgroundColor: THEME.primary },
  billLabel: { fontSize: 11, color: THEME.textSub, marginBottom: 2 },
  billVal: { fontSize: 14, fontWeight: '700', color: THEME.text },
  billTotalLabel: { fontSize: 11, color: '#DDD6FE', marginBottom: 2 },
  billTotalVal: { fontSize: 16, fontWeight: '900', color: '#FFF' },
});
