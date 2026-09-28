// src/screens/OrderConfirmedScreen.jsx — Matches reference mockup (bag hero + horizontal steps)

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../context/AuthContext';

const T = {
  bg:     '#0B0C18',
  card:   '#14162A',
  border: 'rgba(255,255,255,0.08)',
  red:    '#FF3D3D',
  green:  '#22C55E',
  white:  '#FFFFFF',
  muted:  '#6B7280',
  sub:    '#9CA3AF',
};

// ── Pulsing circle behind the active step icon ─────────────────────────────
function PulseRing({ color }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[
      styles.pulseRing,
      {
        borderColor: color,
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
        transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }],
      },
    ]} />
  );
}

// ── Horizontal 4-step progress bar ────────────────────────────────────────
function HorizontalSteps({ orderStatus }) {
  const isReady      = orderStatus === 'READY';
  const isCompleted  = orderStatus === 'COMPLETED';
  const isCancelled  = orderStatus === 'CANCELLED';
  const isPreparing  = orderStatus === 'PREPARING';

  // step index: 0=confirmed, 1=payment, 2=preparing, 3=ready
  const currentStep = isCompleted ? 3 : isReady ? 2 : isPreparing ? 2 : 1;
  const activeStep  = isCompleted ? 3 : isReady ? 3 : isPreparing ? 2 : 1;

  const steps = [
    { label: 'Order\nConfirmed',   icon: '✓',   doneByDefault: true },
    { label: 'Payment\nVerified',  icon: '✓',   doneByDefault: false },
    { label: 'Preparing\nYour Food', icon: '🍴', doneByDefault: false },
    { label: 'Ready for\nCollection', icon: '⬛', doneByDefault: false },
  ];

  return (
    <View style={styles.stepsRow}>
      {steps.map((step, idx) => {
        const isDone   = idx < activeStep || step.doneByDefault || (idx === 1 && !isCancelled);
        const isActive = idx === activeStep - (isCompleted ? 0 : 0) || (idx === 2 && isPreparing);
        const isGray   = !isDone && !isActive;

        // For the active preparing step, show fork icon in red circle
        const showActive = isPreparing && idx === 2;
        const showDone   = (idx === 0) || (idx === 1 && !isCancelled) || (idx === 2 && (isReady || isCompleted)) || (idx === 3 && isCompleted);
        const showGray   = !showDone && !showActive;

        return (
          <React.Fragment key={idx}>
            <View style={styles.stepItem}>
              {/* Icon */}
              <View style={styles.stepIconWrap}>
                {showDone ? (
                  <View style={styles.stepDotDone}>
                    <Text style={styles.stepDotCheck}>✓</Text>
                  </View>
                ) : showActive ? (
                  <View style={styles.stepDotActive}>
                    <PulseRing color={T.red} />
                    <Text style={styles.stepDotFork}>🍴</Text>
                  </View>
                ) : (
                  <View style={styles.stepDotGray}>
                    <Text style={styles.stepDotGrayIcon}>⬡</Text>
                  </View>
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                showDone  && styles.stepLabelDone,
                showActive && styles.stepLabelActive,
              ]}>
                {step.label}
              </Text>
            </View>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                (idx === 0 || (idx === 1 && !isCancelled)) && styles.stepLineDone,
              ]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ── Receipt row helper ─────────────────────────────────────────────────────
function RRow({ label, value, bold, valColor, valSize }) {
  return (
    <View style={styles.rRow}>
      <Text style={styles.rLabel}>{label}</Text>
      <Text style={[
        bold ? styles.rValBold : styles.rVal,
        valColor && { color: valColor },
        valSize  && { fontSize: valSize },
      ]}>
        {value}
      </Text>
    </View>
  );
}

// ── MAIN SCREEN ────────────────────────────────────────────────────────────
export default function OrderConfirmedScreen({ route, navigation }) {
  const { order } = route?.params || {};
  const { user }  = useAuth();

  const [liveOrder,   setLiveOrder]   = useState(order || {});
  const [showReceipt, setShowReceipt] = useState(false);

  // Entrance animation
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  }, []);

  // Live Firestore updates
  useEffect(() => {
    if (!order?.id) return;
    const unsub = onSnapshot(
      doc(db, 'orders', order.id),
      (snap) => { if (snap.exists()) setLiveOrder({ id: snap.id, ...snap.data() }); },
      (err)  => console.error('Order listener:', err)
    );
    return () => unsub();
  }, [order?.id]);

  const orderStatus   = String(liveOrder?.orderStatus   || 'PREPARING').toUpperCase();
  const paymentStatus = String(liveOrder?.paymentStatus || 'PAID').toUpperCase();
  const amountPaid    = liveOrder?.totalAmount || 0;
  const items         = liveOrder?.items || [];
  const isReady       = orderStatus === 'READY';
  const isCompleted   = orderStatus === 'COMPLETED';
  const isCancelled   = orderStatus === 'CANCELLED';

  const cleanOrderNum = String(
    liveOrder?.orderId || liveOrder?.orderNumber || liveOrder?.id?.slice(0, 8) || 'NMIMS0000'
  ).replace(/^#+/, '');

  const placedAt   = liveOrder?.placedAt || '';
  const dateString = liveOrder?.date     || '';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />

      {/* ── TOP NAVBAR ── */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>NMIMS Canteen</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>

          {/* ── HERO: bag emoji + green checkmark + sparkles ── */}
          <View style={styles.heroWrap}>
            {/* Sparkle dots */}
            {[
              { top: 10, left: 20,  color: '#FF6B35', sz: 8 },
              { top: 30, left: 50,  color: '#FFD700', sz: 6 },
              { top: 8,  right: 22, color: '#22C55E', sz: 7 },
              { top: 35, right: 48, color: '#FF3D3D', sz: 5 },
              { top: 70, left: 15,  color: '#FFD700', sz: 6 },
              { top: 68, right: 18, color: '#22C55E', sz: 8 },
              { top: 45, left: 5,   color: '#FF6B35', sz: 5 },
              { top: 50, right: 5,  color: '#FFD700', sz: 5 },
            ].map((d, i) => (
              <View key={i} style={{
                position: 'absolute', top: d.top, left: d.left, right: d.right,
                width: d.sz, height: d.sz, borderRadius: d.sz / 2, backgroundColor: d.color,
              }} />
            ))}

            {/* Bag emoji */}
            <View style={styles.bagCircle}>
              <Text style={styles.bagEmoji}>🛍️</Text>
            </View>

            {/* Green checkmark overlay */}
            <View style={styles.greenCheck}>
              <Text style={styles.greenCheckText}>✓</Text>
            </View>
          </View>

          {/* ── TITLE ── */}
          <View style={styles.titleRow}>
            <Text style={styles.titleLeft}>Thank You </Text>
            <Text style={styles.titleRed}>for Your Order!</Text>
          </View>
          <Text style={styles.heroSub}>
            {isReady ? 'Your food is ready! 🔔' : isCompleted ? 'Order completed! 🎉' : 'Your food is being prepared 🍲'}
          </Text>

          {/* ── ORDER CONFIRMED CARD ── */}
          <View style={styles.orderCard}>
            <View style={styles.orderCardIcon}>
              <Text style={styles.orderCardIconEmoji}>🧾</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.orderCardTitleRow}>
                <Text style={styles.orderCardTitle}>Order Confirmed</Text>
                <Text style={styles.greenTick}> ✅</Text>
              </View>
              <Text style={styles.orderCardNum}>Order #{cleanOrderNum}</Text>
              <Text style={styles.orderCardDate}>
                {dateString}{dateString && placedAt ? ', ' : ''}{placedAt}
              </Text>
            </View>
          </View>

          {/* ── HORIZONTAL PROGRESS STEPS ── */}
          <View style={styles.stepsCard}>
            <HorizontalSteps orderStatus={orderStatus} />
          </View>

          {/* ── NOTIFICATION BANNER ── */}
          {!isCompleted && !isCancelled && (
            <View style={styles.notifCard}>
              <View style={styles.notifIcon}>
                <Text style={styles.notifEmoji}>🔔</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>
                  {isReady
                    ? 'Your food is ready to collect!'
                    : "We'll notify you when your food is ready."}
                </Text>
                <Text style={styles.notifSub}>
                  Please collect it from the canteen counter.
                </Text>
              </View>
            </View>
          )}

          {/* ── BUTTONS ── */}
          <View style={styles.btnGroup}>
            <TouchableOpacity
              style={styles.redBtn}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('OrdersTab')}
            >
              <Text style={styles.redBtnText}>View My Orders 📋</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.darkBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('HomeTab')}
            >
              <Text style={styles.darkBtnText}>Back to Home 🏠</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ghostBtn}
              activeOpacity={0.8}
              onPress={() => setShowReceipt(true)}
            >
              <Text style={styles.ghostBtnText}>📄 View Receipt & Payment Details</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>

      {/* ══════════════════════════════════════
            RECEIPT MODAL
      ══════════════════════════════════════ */}
      <Modal
        visible={showReceipt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReceipt(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.receiptCard}>
            {/* Header */}
            <View style={styles.receiptHdr}>
              <Text style={{ fontSize: 28, marginBottom: 6 }}>🍽️</Text>
              <Text style={styles.receiptTitle}>NMIMS Canteen Indore</Text>
              <Text style={styles.receiptSub}>Official Payment & Order Receipt</Text>
              <View style={styles.dash} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <RRow label="Order Number" value={`#${cleanOrderNum}`} bold />
              <RRow label="Date & Time"  value={`${dateString}${dateString && placedAt ? ' · ' : ''}${placedAt || 'Just now'}`} />
              <RRow label="Student Name" value={liveOrder?.studentName || user?.name || 'Student'} />
              <RRow label="Email / SAP"  value={liveOrder?.studentEmail || user?.email || 'NMIMS Student'} />

              <View style={styles.receiptPayBox}>
                <RRow label="Payment Method" value="UPI (nmimscanteen@upi)" bold />
                <RRow label="Payment Status" value={`✓ ${paymentStatus}`} valColor="#34D399" />
                <RRow label="Kitchen Status" value={orderStatus}           valColor="#60A5FA" />
              </View>

              <Text style={styles.receiptItemsHdr}>ITEMS BREAKDOWN</Text>
              {items.map((it, i) => {
                const n = it.name || it.food?.name || 'Item';
                const p = it.price || it.food?.price || 0;
                const q = it.quantity || 1;
                return (
                  <View key={i} style={styles.receiptItemRow}>
                    <Text style={styles.receiptItemName}>{n}</Text>
                    <Text style={styles.receiptItemQty}>×{q}</Text>
                    <Text style={styles.receiptItemPrice}>₹{p * q}</Text>
                  </View>
                );
              })}

              <View style={styles.dash} />
              <RRow label="Subtotal"          value={`₹${amountPaid}`} />
              <RRow label="GST & Packaging"   value="₹0 (Included)" />
              <RRow label="Total Paid"        value={`₹${amountPaid}`} bold valColor={T.red} valSize={18} />

              <View style={styles.stamp}>
                <Text style={styles.stampText}>★ NMIMS CANTEEN VERIFIED ★</Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeBtn}
              activeOpacity={0.85}
              onPress={() => setShowReceipt(false)}
            >
              <Text style={styles.closeBtnText}>Close Receipt ✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── STYLES ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  content: { paddingHorizontal: 18, paddingBottom: 20, gap: 14 },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: T.bg,
  },
  backBtn:   { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow: { color: T.white, fontSize: 22, fontWeight: '700' },
  navTitle:  { color: T.white, fontSize: 17, fontWeight: '900' },

  // Hero
  heroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    marginTop: 8,
    position: 'relative',
  },
  bagCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,165,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,165,0,0.2)',
  },
  bagEmoji: { fontSize: 60 },
  greenCheck: {
    position: 'absolute',
    right: '30%',
    bottom: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: T.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: T.bg,
    shadowColor: T.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  greenCheckText: { color: T.white, fontSize: 18, fontWeight: '900' },

  // Title
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  titleLeft: { color: T.white, fontSize: 24, fontWeight: '900' },
  titleRed:  { color: T.red,   fontSize: 24, fontWeight: '900' },
  heroSub:   { color: T.sub,   fontSize: 13, textAlign: 'center', marginBottom: 4 },

  // Order confirmed card
  orderCard: {
    backgroundColor: T.card,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: T.border,
  },
  orderCardIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,61,61,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderCardIconEmoji:  { fontSize: 22 },
  orderCardTitleRow:   { flexDirection: 'row', alignItems: 'center' },
  orderCardTitle:      { color: T.white, fontSize: 15, fontWeight: '900' },
  greenTick:           { fontSize: 15 },
  orderCardNum:        { color: T.sub, fontSize: 13, marginTop: 3, fontWeight: '700' },
  orderCardDate:       { color: T.muted, fontSize: 12, marginTop: 2 },

  // Horizontal steps card
  stepsCard: {
    backgroundColor: T.card,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: T.border,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  // Done step (green circle + check)
  stepDotDone: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: T.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotCheck: { color: T.white, fontSize: 14, fontWeight: '900' },
  // Active step (red circle + fork)
  stepDotActive: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: T.red,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  stepDotFork:    { fontSize: 14 },
  // Gray step (empty box icon)
  stepDotGray: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  stepDotGrayIcon: { color: T.muted, fontSize: 14 },
  // Pulse ring
  pulseRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
  },
  // Connector line between steps
  stepLine: {
    height: 2,
    flex: 0.3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 14,
  },
  stepLineDone: { backgroundColor: T.green },
  // Labels
  stepLabel:       { color: T.muted,  fontSize: 9,  textAlign: 'center', lineHeight: 13, fontWeight: '600' },
  stepLabelDone:   { color: T.white,  fontWeight: '700' },
  stepLabelActive: { color: T.white,  fontWeight: '900' },

  // Notification banner
  notifCard: {
    backgroundColor: 'rgba(200,0,0,0.15)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,61,61,0.3)',
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,61,61,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifEmoji: { fontSize: 20 },
  notifTitle: { color: T.white,  fontSize: 13, fontWeight: '800', marginBottom: 3 },
  notifSub:   { color: '#FCA5A5', fontSize: 12, lineHeight: 17 },

  // Buttons
  btnGroup: { gap: 10 },
  redBtn: {
    backgroundColor: T.red,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: T.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 7,
  },
  redBtnText: { color: T.white, fontSize: 16, fontWeight: '900' },
  darkBtn: {
    backgroundColor: '#1E2035',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  darkBtnText: { color: T.white, fontSize: 15, fontWeight: '700' },
  ghostBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostBtnText: { color: T.muted, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },

  // Receipt modal
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  receiptCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#1A1C2A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 22,
    elevation: 14,
  },
  receiptHdr:   { alignItems: 'center', marginBottom: 6 },
  receiptTitle: { color: T.white, fontSize: 20, fontWeight: '900' },
  receiptSub:   { color: T.muted,  fontSize: 12, marginTop: 2 },
  dash: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.12)',
    marginVertical: 14,
  },
  receiptPayBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  receiptItemsHdr: {
    color: T.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginTop: 8, marginBottom: 6,
  },
  receiptItemRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  receiptItemName:  { flex: 1, color: T.white, fontSize: 12, fontWeight: '600' },
  receiptItemQty:   { color: T.muted,  fontSize: 12, marginHorizontal: 8 },
  receiptItemPrice: { color: T.white, fontSize: 12, fontWeight: '800' },
  stamp: {
    alignItems: 'center', marginVertical: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)', backgroundColor: 'rgba(52,211,153,0.07)',
  },
  stampText: { color: '#34D399', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  closeBtn: {
    marginTop: 14, backgroundColor: T.red, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  closeBtnText: { color: T.white, fontSize: 15, fontWeight: '900' },

  // Receipt rows
  rRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  rLabel:  { color: T.muted, fontSize: 12 },
  rVal:    { color: T.white, fontSize: 12, fontWeight: '600' },
  rValBold:{ color: T.white, fontSize: 13, fontWeight: '900' },
});
