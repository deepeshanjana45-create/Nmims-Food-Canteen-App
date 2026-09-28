// src/screens/ProfileScreen.jsx — Student profile screen with Auth integration

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

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

export default function ProfileScreen({ navigation }) {
  const { orders } = useCart();
  const { isLoggedIn, user, openLoginModal, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  const studentInfo = user || {
    name: 'Guest Student',
    sapId: 'Not Logged In',
    branch: 'NMIMS Student',
    year: 'Campus Portal',
    email: 'guest@nmims.edu.in',
    campus: 'Indore Campus',
  };

  const menuItems = [
    { icon: '📋', label: 'Order History', onPress: () => navigation.navigate('OrdersTab') },
    { icon: '📍', label: 'Campus Pickup Location', sub: 'NMIMS Main Canteen, Ground Floor', onPress: () => Alert.alert('Location', 'NMIMS Indore Canteen, Main Building') },
    { icon: '💳', label: 'Payment Options', sub: 'UPI · Cards · Canteen Wallet', onPress: () => Alert.alert('Payment Info', 'Pay via UPI, Cards, or Canteen Counter.') },
    { icon: '🎁', label: 'Student Offers', sub: 'STUDENT20 active', onPress: () => Alert.alert('Offer active!', '20% off for NMIMS Students.') },
    { icon: '⭐', label: 'Feedback & Support', sub: 'canteen@nmims.edu.in', onPress: () => Alert.alert('Support', 'Contact: canteen@nmims.edu.in') },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_THEME.cardBg} />

      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatar}>🎓</Text>
        </View>
        <Text style={styles.name}>{studentInfo.name}</Text>
        <Text style={styles.branch}>
          {studentInfo.email ? `${studentInfo.email}${studentInfo.phone ? ' • ' + studentInfo.phone : ''}` : studentInfo.branch}
        </Text>
        <View style={styles.campusPill}>
          <Text style={styles.campusText}>📍 {studentInfo.campus}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Guest Warning / Login CTA Card */}
        {!isLoggedIn ? (
          <View style={styles.loginCtaCard}>
            <Text style={styles.loginCtaTitle}>🔐 Student Login Required</Text>
            <Text style={styles.loginCtaDesc}>
              Log in to save your orders, earn student rewards, and complete canteen orders.
            </Text>
            <TouchableOpacity
              style={styles.redLoginBtn}
              onPress={() => openLoginModal('Log in to access your student profile')}
            >
              <Text style={styles.redLoginBtnText}>Log In Now 🔑</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{orders.length}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>₹{totalSpent}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>Active</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        )}

        {/* Menu Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Settings</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuRow,
                  index < menuItems.length - 1 && styles.menuRowBorder,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuLeft}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    {item.sub && <Text style={styles.menuSub}>{item.sub}</Text>}
                  </View>
                </View>
                <Text style={styles.menuArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notification Switch */}
        <View style={styles.prefCard}>
          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <Text style={styles.prefIcon}>🔔</Text>
              <Text style={styles.prefLabel}>Order Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#475569', true: DARK_THEME.primaryRed }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Logout Button if logged in */}
        {isLoggedIn && (
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutBtnText}>Log Out 🚪</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK_THEME.bg },

  header: {
    backgroundColor: DARK_THEME.cardBg,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: DARK_THEME.primaryRed,
  },
  avatar: { fontSize: 38 },
  name: { fontSize: 22, fontWeight: '900', color: DARK_THEME.white, marginBottom: 2 },
  rollNo: { fontSize: 12, color: DARK_THEME.primaryRed, fontWeight: '800', marginBottom: 2 },
  branch: { fontSize: 12, color: DARK_THEME.textMuted, marginBottom: 8 },
  campusPill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
  },
  campusText: { fontSize: 11, color: DARK_THEME.textSub, fontWeight: '600' },

  content: { paddingHorizontal: 16, paddingTop: 16 },

  loginCtaCard: {
    backgroundColor: DARK_THEME.cardBg,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DARK_THEME.primaryRed,
  },
  loginCtaTitle: { fontSize: 18, fontWeight: '900', color: DARK_THEME.white, marginBottom: 6 },
  loginCtaDesc: { fontSize: 12, color: DARK_THEME.textMuted, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  redLoginBtn: {
    backgroundColor: DARK_THEME.primaryRed,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  redLoginBtnText: { color: DARK_THEME.white, fontSize: 15, fontWeight: '900' },

  statsCard: {
    backgroundColor: DARK_THEME.cardBg,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
  },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '900', color: DARK_THEME.primaryRed },
  statLabel: { fontSize: 11, color: DARK_THEME.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: DARK_THEME.cardBorder },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: DARK_THEME.white, marginBottom: 10 },
  menuCard: {
    backgroundColor: DARK_THEME.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: DARK_THEME.cardBorder },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { fontSize: 20 },
  menuLabel: { fontSize: 14, fontWeight: '800', color: DARK_THEME.white },
  menuSub: { fontSize: 11, color: DARK_THEME.textMuted, marginTop: 2 },
  menuArrow: { color: DARK_THEME.textMuted, fontSize: 16 },

  prefCard: {
    backgroundColor: DARK_THEME.cardBg,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
    marginBottom: 16,
  },
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prefLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  prefIcon: { fontSize: 18 },
  prefLabel: { fontSize: 14, fontWeight: '800', color: DARK_THEME.white },

  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: 8,
  },
  logoutBtnText: { color: '#EF4444', fontSize: 15, fontWeight: '900' },
});
