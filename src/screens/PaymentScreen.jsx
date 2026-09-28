// src/screens/PaymentScreen.jsx — Professional UPI QR Payment Screen with Live Firestore Order Creation

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
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
// import { registerForPushNotificationsAsync } from '../services/notificationService';

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

  // Dynamic order number generator e.g. NMIMS1047
  const generateOrderNumber = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `NMIMS${randomNum}`;
  };

  // Payment Verification Handler creating order in Firestore
  const handleVerifyAndCompletePayment = async () => {
    setIsVerifying(true);

    try {
      const generatedOrderNumber = generateOrderNumber();

      const itemsList = finalItems.map((item) => ({
        name: item.food?.name || item.name || 'Food item',
        quantity: item.quantity || 1,
        price: item.food?.price || item.price || 0,
      }));

      // Get Push Token for notifications (Uncomment when using EAS Build)
      let pushToken = null;
      /*
      try {
        pushToken = await registerForPushNotificationsAsync();
      } catch (err) {
        console.log('Push token not retrieved', err);
      }
      */

      // Document for Firestore `orders` collection
      const orderPayload = {
        orderId: generatedOrderNumber,
        studentName: user?.name || 'Student',
        studentEmail: user?.email || user?.sapId || 'student@nmims.edu',
        items: itemsList,
        totalAmount: finalAmount,
        paymentStatus: 'PAID',
        orderStatus: 'PREPARING',
        createdAt: serverTimestamp(),
        placedAt: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        pushToken: pushToken || null,
      };

      // 1. Write to Firestore 'orders'
      const docRef = await addDoc(collection(db, 'orders'), orderPayload);

      const completeOrder = {
        id: docRef.id,
        ...orderPayload,
      };

      // 2. Save order in local CartContext & clear cart
      placeOrderWithDetails(completeOrder);

      // 3. Navigate to Order Confirmed Screen with order document ID
      navigation.navigate('OrderConfirmed', { order: completeOrder });
    } catch (err) {
      console.error('Error creating order in Firestore:', err);
      Alert.alert(
        'Order Placement Error',
        'Could not send order to the canteen database. Please check your connection and try again.'
      );
    } finally {
      setIsVerifying(false);
    }
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
          <Text style={styles.amountSub}>Includes canteen tax & packaging</Text>
        </View>

        {/* Dynamic UPI QR Code */}
        <View style={styles.qrCard}>
          <View style={styles.qrFrame}>
            <Image
              source={{ uri: qrCodeUrl }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.scanPayTitle}>Scan & Pay via any UPI App</Text>
          <View style={styles.upiPill}>
            <Text style={styles.upiLabel}>UPI ID: </Text>
            <Text style={styles.upiValue}>{upiId}</Text>
          </View>
        </View>

        {/* Final Place Order Button */}
        <TouchableOpacity
          style={[styles.redCompleteBtn, isVerifying && styles.disabledBtn]}
          activeOpacity={0.88}
          disabled={isVerifying}
          onPress={handleVerifyAndCompletePayment}
        >
          {isVerifying ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.redCompleteBtnText}>Placing Order into Canteen System...</Text>
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.3)',
  },
  upiLabel: { color: DARK_THEME.textMuted, fontSize: 12, fontWeight: '600' },
  upiValue: { color: DARK_THEME.white, fontSize: 13, fontWeight: '800' },

  // Complete Payment Button
  redCompleteBtn: {
    backgroundColor: DARK_THEME.primaryRed,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  redCompleteBtnText: { color: DARK_THEME.white, fontSize: 16, fontWeight: '900' },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
