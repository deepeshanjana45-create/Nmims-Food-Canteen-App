import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const THEME = {
  bg: '#12131C',
  cardBg: '#1C1E2D',
  cardBorder: 'rgba(255,255,255,0.08)',
  primaryRed: '#FF4D4D',
  primaryRedDark: '#E03E3E',
  white: '#FFFFFF',
  textMuted: '#94A3B8',
  textSub: '#CBD5E1',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

const STATUS_STEPS = ['Order Placed', 'Preparing', 'Ready', 'Picked Up'];

function mapOrderStatus(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'READY') return 'Ready';
  if (s === 'PREPARING') return 'Preparing';
  if (s === 'COMPLETED') return 'Picked Up';
  if (s === 'CANCELLED') return 'Cancelled';
  return 'Order Placed';
}

function StatusBadge({ status }) {
  const isReady = status === 'Ready';
  const isPreparing = status === 'Preparing';
  const isCancelled = status === 'Cancelled';
  const isPickedUp = status === 'Picked Up';

  let bg = 'rgba(245, 158, 11, 0.15)';
  let color = '#FCD34D';

  if (isReady) {
    bg = 'rgba(16, 185, 129, 0.25)';
    color = '#34D399';
  } else if (isPreparing) {
    bg = 'rgba(59, 130, 246, 0.18)';
    color = '#60A5FA';
  } else if (isCancelled) {
    bg = 'rgba(239, 68, 68, 0.15)';
    color = '#FCA5A5';
  } else if (isPickedUp) {
    bg = 'rgba(16, 185, 129, 0.15)';
    color = '#6EE7B7';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>
        {isReady ? '🔔 ' : isPreparing ? '👨‍🍳 ' : ''}{status}
      </Text>
    </View>
  );
}

function ProgressTracker({ status }) {
  if (status === 'Cancelled') {
    return (
      <View style={styles.cancelledBox}>
        <Text style={styles.cancelledText}>✕ Order was cancelled / rejected by canteen</Text>
      </View>
    );
  }

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
                idx === currentIdx && step === 'Ready' && styles.progressDotReady,
              ]}
            >
              {idx <= currentIdx && (
                <Text style={styles.progressCheck}>{step === 'Ready' ? '🔔' : '✓'}</Text>
              )}
            </View>
            <Text
              style={[
                styles.progressLabel,
                idx <= currentIdx && styles.progressLabelActive,
                idx === currentIdx && step === 'Ready' && styles.progressLabelReady,
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
  const { orders: localOrders } = useCart();
  const { isLoggedIn, user, openLoginModal } = useAuth();

  const [firestoreOrders, setFirestoreOrders] = useState([]);
  const [receiptOrder, setReceiptOrder] = useState(null);

  // Subscribe to student's Firestore orders in real-time
  useEffect(() => {
    const studentIdentifier = user?.email || user?.sapId;

    let ordersQuery;
    if (studentIdentifier) {
      ordersQuery = query(
        collection(db, 'orders'),
        where('studentEmail', '==', studentIdentifier)
      );
    } else {
      ordersQuery = query(collection(db, 'orders'));
    }

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Sort descending in memory (avoids requiring a Firestore composite index)
        list.sort((a, b) => {
          const timeA = a.createdAt?.toMillis
            ? a.createdAt.toMillis()
            : a.createdAt?.seconds
            ? a.createdAt.seconds * 1000
            : new Date(a.date || 0).getTime();
          const timeB = b.createdAt?.toMillis
            ? b.createdAt.toMillis()
            : b.createdAt?.seconds
            ? b.createdAt.seconds * 1000
            : new Date(b.date || 0).getTime();
          return timeB - timeA;
        });

        setFirestoreOrders(list);
      },
      (err) => {
        console.error('Error fetching student orders:', err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Combine Firestore orders with any local orders
  const displayOrders = firestoreOrders.length > 0 ? firestoreOrders : localOrders;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSub}>
          {displayOrders.length} order{displayOrders.length !== 1 ? 's' : ''} placed
        </Text>
      </View>

      {displayOrders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyDesc}>Place your meal from the menu and track it live!</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate('MenuTab')}
          >
            <Text style={styles.browseBtnText}>Browse Today's Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {displayOrders.map((order) => {
            const mappedStatus = mapOrderStatus(order.orderStatus || order.status);
            const isReady = mappedStatus === 'Ready';
            const isPreparing = mappedStatus === 'Preparing';

            const items = order.items || [];
            const total = order.totalAmount || order.total || order.subtotal || 0;
            const cleanOrderId = String(
              order.orderId || order.orderNumber || order.id?.slice(0, 8) || ''
            ).replace(/^#+/, '');

            return (
              <View key={order.id} style={styles.orderCard}>
                {/* READY COLLECT BANNER */}
                {isReady && (
                  <View style={styles.orderReadyBanner}>
                    <Text style={styles.orderReadyBannerIcon}>🔔</Text>
                    <Text style={styles.orderReadyBannerText}>
                      Your food is ready, please collect it at counter!
                    </Text>
                  </View>
                )}

                {/* PREPARING BANNER */}
                {isPreparing && (
                  <View style={styles.orderPreparingBanner}>
                    <Text style={styles.orderPreparingIcon}>👨‍🍳</Text>
                    <Text style={styles.orderPreparingText}>
                      Your order is preparing in the canteen kitchen!
                    </Text>
                  </View>
                )}

                {/* Order header */}
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>Order #{cleanOrderId}</Text>
                    <Text style={styles.orderDate}>
                      {order.date || 'Today'} · {order.placedAt || 'Just now'}
                    </Text>
                  </View>
                  <StatusBadge status={mappedStatus} />
                </View>

                {/* Progress tracker */}
                <ProgressTracker status={mappedStatus} />

                {/* Items */}
                <View style={styles.itemsSection}>
                  <Text style={styles.itemsTitle}>Items Ordered</Text>
                  {items.map((item, idx) => {
                    const name = item.name || item.food?.name || 'Food item';
                    const price = item.price || item.food?.price || 0;
                    const quantity = item.quantity || 1;

                    return (
                      <View key={idx} style={styles.orderItem}>
                        <Text style={styles.orderItemBullet}>🍽️</Text>
                        <Text style={styles.orderItemName}>{name}</Text>
                        <Text style={styles.orderItemQty}>×{quantity}</Text>
                        <Text style={styles.orderItemPrice}>₹{price * quantity}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Total & Payment */}
                <View style={styles.billRow}>
                  <View>
                    <Text style={styles.paymentInfoText}>
                      Payment:{' '}
                      <Text
                        style={{
                          fontWeight: '800',
                          color:
                            String(order.paymentStatus || '').toUpperCase() === 'PAID'
                              ? '#34D399'
                              : '#FCD34D',
                        }}
                      >
                        {order.paymentStatus || 'PAID'}
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.billTotalWrap}>
                    <Text style={styles.billTotalLabel}>Total Amount: </Text>
                    <Text style={styles.billTotalVal}>₹{total}</Text>
                  </View>
                </View>

                {/* VIEW RECEIPT & PAYMENT DETAILS BUTTON */}
                <TouchableOpacity
                  style={styles.viewReceiptBtn}
                  activeOpacity={0.8}
                  onPress={() => setReceiptOrder(order)}
                >
                  <Text style={styles.viewReceiptBtnText}>
                    📄 View Receipt & Payment Details
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* =================================
          RECEIPT & PAYMENT DETAILS MODAL
      ================================= */}
      <Modal
        visible={Boolean(receiptOrder)}
        transparent
        animationType="fade"
        onRequestClose={() => setReceiptOrder(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.receiptCard}>
            {/* Receipt Header */}
            <View style={styles.receiptHeader}>
              <View style={styles.receiptLogoWrap}>
                <Text style={styles.receiptLogoIcon}>🍽️</Text>
              </View>
              <Text style={styles.receiptTitle}>NMIMS Canteen Indore</Text>
              <Text style={styles.receiptSub}>Official Payment & Order Receipt</Text>
              <View style={styles.receiptDashedLine} />
            </View>

            {/* Receipt Meta */}
            {receiptOrder && (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.receiptBody}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Order Number:</Text>
                  <Text style={styles.receiptValBold}>
                    #{String(receiptOrder.orderId || receiptOrder.orderNumber || receiptOrder.id?.slice(0, 8) || '').replace(/^#+/, '')}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Date & Time:</Text>
                  <Text style={styles.receiptVal}>
                    {receiptOrder.date || 'Today'} · {receiptOrder.placedAt || 'Just now'}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Student Name:</Text>
                  <Text style={styles.receiptVal}>
                    {receiptOrder.studentName || user?.name || 'Student'}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Student Email/SAP:</Text>
                  <Text style={styles.receiptVal}>
                    {receiptOrder.studentEmail || user?.email || user?.sapId || 'NMIMS Student'}
                  </Text>
                </View>

                {/* Payment Section */}
                <View style={styles.receiptPaymentBox}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Payment Method:</Text>
                    <Text style={styles.receiptValBold}>UPI (nmimscanteen@upi)</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Payment Status:</Text>
                    <Text style={styles.receiptPaidText}>
                      ✓ {String(receiptOrder.paymentStatus || 'PAID').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Kitchen Status:</Text>
                    <Text style={styles.receiptStatusText}>
                      {mapOrderStatus(receiptOrder.orderStatus || receiptOrder.status).toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Items Breakdown */}
                <Text style={styles.receiptItemsTitle}>Items Breakdown</Text>
                {(receiptOrder.items || []).map((it, i) => {
                  const itName = it.name || it.food?.name || 'Item';
                  const itPrice = it.price || it.food?.price || 0;
                  const itQty = it.quantity || 1;
                  return (
                    <View key={i} style={styles.receiptItemRow}>
                      <Text style={styles.receiptItemName}>{itName}</Text>
                      <Text style={styles.receiptItemQty}>×{itQty}</Text>
                      <Text style={styles.receiptItemPrice}>₹{itPrice * itQty}</Text>
                    </View>
                  );
                })}

                <View style={styles.receiptDashedLine} />

                {/* Bill Summary */}
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Subtotal:</Text>
                  <Text style={styles.receiptVal}>
                    ₹{receiptOrder.totalAmount || receiptOrder.total || receiptOrder.subtotal || 0}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Canteen Packaging & GST:</Text>
                  <Text style={styles.receiptVal}>₹0 (Included)</Text>
                </View>
                <View style={[styles.receiptRow, { marginTop: 6 }]}>
                  <Text style={styles.receiptTotalLabel}>Total Paid:</Text>
                  <Text style={styles.receiptTotalVal}>
                    ₹{receiptOrder.totalAmount || receiptOrder.total || receiptOrder.subtotal || 0}
                  </Text>
                </View>

                {/* Stamp */}
                <View style={styles.receiptStamp}>
                  <Text style={styles.receiptStampText}>★ NMIMS CANTEEN VERIFIED ★</Text>
                </View>
              </ScrollView>
            )}

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeReceiptBtn}
              activeOpacity={0.85}
              onPress={() => setReceiptOrder(null)}
            >
              <Text style={styles.closeReceiptBtnText}>Close Receipt ✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },

  header: {
    backgroundColor: THEME.cardBg,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.cardBorder,
  },
  headerTitle: { color: THEME.white, fontSize: 24, fontWeight: '900' },
  headerSub: { color: THEME.textMuted, fontSize: 13, marginTop: 2 },

  list: { padding: 16, gap: 16 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 60, marginBottom: 14 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: THEME.white, marginBottom: 6 },
  emptyDesc: { color: THEME.textMuted, textAlign: 'center', fontSize: 13, lineHeight: 18, marginBottom: 20 },
  browseBtn: {
    backgroundColor: THEME.primaryRed,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  browseBtnText: { color: THEME.white, fontWeight: '800', fontSize: 14 },

  orderCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    gap: 14,
  },

  orderReadyBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderReadyBannerIcon: { fontSize: 22 },
  orderReadyBannerText: { color: '#6EE7B7', fontSize: 13, fontWeight: '800', flex: 1 },

  orderPreparingBanner: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderPreparingIcon: { fontSize: 20 },
  orderPreparingText: { color: '#93C5FD', fontSize: 13, fontWeight: '800', flex: 1 },

  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { color: THEME.white, fontSize: 16, fontWeight: '800' },
  orderDate: { color: THEME.textMuted, fontSize: 12, marginTop: 3 },

  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '800' },

  progressRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  progressStep: { alignItems: 'center', minWidth: 64 },
  progressDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  progressDotActive: { backgroundColor: THEME.primaryRed },
  progressDotReady: { backgroundColor: '#10B981' },
  progressCheck: { color: THEME.white, fontSize: 11, fontWeight: '900' },
  progressLabel: { color: THEME.textMuted, fontSize: 10, fontWeight: '600' },
  progressLabelActive: { color: THEME.white, fontWeight: '800' },
  progressLabelReady: { color: '#34D399', fontWeight: '900' },

  progressLine: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 14 },
  progressLineActive: { backgroundColor: THEME.primaryRed },

  cancelledBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelledText: { color: '#FCA5A5', fontSize: 12, fontWeight: '700' },

  itemsSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 12,
  },
  itemsTitle: { color: THEME.textSub, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  orderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  orderItemBullet: { fontSize: 14, marginRight: 8 },
  orderItemName: { flex: 1, color: THEME.white, fontSize: 13, fontWeight: '600' },
  orderItemQty: { color: THEME.textMuted, fontSize: 13, marginRight: 12, fontWeight: '700' },
  orderItemPrice: { color: THEME.white, fontSize: 13, fontWeight: '800' },

  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 12,
  },
  paymentInfoText: { color: THEME.textMuted, fontSize: 12 },
  billTotalWrap: { flexDirection: 'row', alignItems: 'baseline' },
  billTotalLabel: { color: THEME.textMuted, fontSize: 13 },
  billTotalVal: { color: THEME.white, fontSize: 17, fontWeight: '900' },

  // View Receipt Button
  viewReceiptBtn: {
    marginTop: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewReceiptBtnText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  receiptCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    backgroundColor: '#1E2030',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 14,
  },
  receiptLogoWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,77,77,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  receiptLogoIcon: { fontSize: 24 },
  receiptTitle: { color: THEME.white, fontSize: 19, fontWeight: '900' },
  receiptSub: { color: THEME.textMuted, fontSize: 12, marginTop: 2 },
  receiptDashedLine: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    marginVertical: 12,
  },
  receiptBody: {
    maxHeight: 380,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  receiptLabel: { color: THEME.textMuted, fontSize: 12 },
  receiptVal: { color: THEME.white, fontSize: 12, fontWeight: '600' },
  receiptValBold: { color: THEME.white, fontSize: 13, fontWeight: '800' },
  receiptPaidText: { color: '#34D399', fontSize: 13, fontWeight: '900' },
  receiptStatusText: { color: '#60A5FA', fontSize: 13, fontWeight: '800' },

  receiptPaymentBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  receiptItemsTitle: {
    color: THEME.textSub,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  receiptItemName: { color: THEME.white, fontSize: 12, flex: 1 },
  receiptItemQty: { color: THEME.textMuted, fontSize: 12, marginHorizontal: 8 },
  receiptItemPrice: { color: THEME.white, fontSize: 12, fontWeight: '700' },

  receiptTotalLabel: { color: THEME.white, fontSize: 15, fontWeight: '900' },
  receiptTotalVal: { color: THEME.primaryRed, fontSize: 18, fontWeight: '900' },

  receiptStamp: {
    alignItems: 'center',
    marginVertical: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
  },
  receiptStampText: { color: '#34D399', fontSize: 11, fontWeight: '900', letterSpacing: 1 },

  closeReceiptBtn: {
    marginTop: 14,
    backgroundColor: THEME.primaryRed,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeReceiptBtnText: { color: THEME.white, fontSize: 14, fontWeight: '800' },
});
