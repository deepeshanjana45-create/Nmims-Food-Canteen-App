// src/screens/PaymentScreen.jsx — Professional UPI QR Payment Screen for NMIMS Canteen App

import React, { useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const DARK_THEME = {
  bg: '#12131C',
  cardBg: '#1C1E2D',
  cardBorder: 'rgba(255,255,255,0.08)',
  primaryRed: '#FF4D4D',
  primaryRedDark: '#E03E3E',
  white: '#FFFFFF',
  textMuted: '#94A3B8',
  textSub: '#CBD5E1',
  success: '#10B981',
};

export default function PaymentScreen({ route, navigation }) {
  const { cartItems, totalAmount } = route.params || {};
  const { items, cartTotal, placeOrderWithDetails } = useCart();
  const { user } = useAuth();

  const finalAmount = totalAmount || cartTotal || 70;
  const finalItems = cartItems || items;

  const [isVerifying, setIsVerifying] = useState(false);

  // UPI ID for NMIMS Canteen
  const upiId = 'nmimscanteen@upi';

  // Dynamic QR Code URL generating UPI payment intent QR
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=upi://pay?pa=${encodeURIComponent(
    upiId
  )}&pn=NMIMS%20Canteen&am=${finalAmount}&cu=INR`;

  // Dynamic order number generator e.g. #NMIMS1047
  const generateOrderNumber = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `#NMIMS${randomNum}`;
  };

  // Payment Verification Handler (Structured for Razorpay/API Integration)
  const handleVerifyAndCompletePayment = async () => {
    setIsVerifying(true);

    // Simulate structured payment verification check (connect Razorpay/Payment Webhook here)
    setTimeout(() => {
      setIsVerifying(false);

      const generatedOrderNumber = generateOrderNumber();

      // Create Order document (Structured for Firestore creation)
      const orderDocument = {
        orderNumber: generatedOrderNumber,
        userId: user?.sapId || 'NMIMS70012023045',
        userName: user?.name || 'Rahul Sharma',
        items: finalItems,
        totalAmount: finalAmount,
        paymentStatus: 'paid',
        orderStatus: 'preparing',
        createdAt: new Date().toISOString(),
        placedAt: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      };

      // Save order in CartContext & clear cart
      placeOrderWithDetails(orderDocument);

      // Navigate to Order Confirmed Screen
      navigation.navigate('OrderConfirmed', { order: orderDocument });
    }, 1800);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_THEME.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Total Amount Payable Banner */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>₹{finalAmount}</Text>
          <Text style={styles.amountSub}>SVKM's NMIMS Canteen Indore</Text>
        </View>

        {/* Large UPI QR Code Card */}
        <View style={styles.qrCard}>
          <View style={styles.qrFrame}>
            <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} resizeMode="contain" />
          </View>

          <Text style={styles.scanPayTitle}>Scan & Pay</Text>

          {/* UPI ID Pill */}
          <View style={styles.upiPill}>
            <Text style={styles.upiLabel}>UPI ID:</Text>
            <Text style={styles.upiValue}>{upiId}</Text>
          </View>
        </View>

        {/* Payment Instructions Card */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Payment Instructions:</Text>
          <View style={styles.stepList}>
            <Text style={styles.stepText}>1. Open Google Pay / PhonePe / Paytm</Text>
            <Text style={styles.stepText}>2. Scan the QR code above</Text>
            <Text style={styles.stepText}>3. Complete the payment of ₹{finalAmount}</Text>
            <Text style={styles.stepText}>4. Return to the NMIMS Canteen app and tap below</Text>
          </View>
        </View>

        {/* Complete Payment Button */}
        <TouchableOpacity
          style={styles.redCompleteBtn}
          activeOpacity={0.88}
          onPress={handleVerifyAndCompletePayment}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.redCompleteBtnText}>Verifying Payment...</Text>
            </View>
          ) : (
            <Text style={styles.redCompleteBtnText}>I've Completed Payment ✓</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK_THEME.bg },

  header: {
    backgroundColor: DARK_THEME.cardBg,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.cardBorder,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  backBtnText: { color: DARK_THEME.white, fontSize: 13, fontWeight: '700' },
  headerTitle: { color: DARK_THEME.white, fontSize: 20, fontWeight: '900' },

  content: { padding: 16, gap: 16 },

  // Amount Card
  amountCard: {
    backgroundColor: DARK_THEME.cardBg,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
  },
  amountLabel: { fontSize: 12, color: DARK_THEME.textMuted, fontWeight: '600' },
  amountValue: { fontSize: 36, fontWeight: '900', color: DARK_THEME.primaryRed, marginVertical: 4 },
  amountSub: { fontSize: 12, color: DARK_THEME.textSub, fontWeight: '500' },

  // QR Code Card
  qrCard: {
    backgroundColor: DARK_THEME.cardBg,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
  },
  qrFrame: {
    width: 220,
    height: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: DARK_THEME.primaryRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  qrImage: { width: '100%', height: '100%' },

  scanPayTitle: { fontSize: 18, fontWeight: '900', color: DARK_THEME.white, marginBottom: 10 },

  upiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: DARK_THEME.primaryRed,
  },
  upiLabel: { fontSize: 12, color: DARK_THEME.textMuted, fontWeight: '600' },
  upiValue: { fontSize: 13, color: DARK_THEME.primaryRed, fontWeight: '900' },

  // Instructions Card
  instructionsCard: {
    backgroundColor: DARK_THEME.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
  },
  instructionsTitle: { fontSize: 14, fontWeight: '800', color: DARK_THEME.white, marginBottom: 10 },
  stepList: { gap: 6 },
  stepText: { fontSize: 12, color: DARK_THEME.textMuted, lineHeight: 18, fontWeight: '500' },

  // Complete Payment Button
  redCompleteBtn: {
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
    marginTop: 6,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  redCompleteBtnText: { color: DARK_THEME.white, fontSize: 16, fontWeight: '900' },
});
