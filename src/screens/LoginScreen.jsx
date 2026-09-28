// src/screens/LoginScreen.jsx — Email Authentication Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const DARK_THEME = {
  bg: '#12131C',
  cardBg: '#1C1E2D',
  cardBorder: 'rgba(255,255,255,0.12)',
  primaryRed: '#FF4D4D',
  white: '#FFFFFF',
  textMuted: '#94A3B8',
  inputBg: 'rgba(255,255,255,0.06)',
};

export default function LoginScreen({ navigation }) {
  const {
    sendEmailOtp,
    verifyEmailOtp,
    resendEmailOtp,
    authLoading,
    authError,
    clearAuthError,
  } = useAuth();

  const [step, setStep] = useState('INPUT'); // 'INPUT' | 'OTP'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer = null;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleSendOtp = async () => {
    clearAuthError();
    try {
      await sendEmailOtp(email);
      setStep('OTP');
      setCountdown(30);
      setOtp('');
    } catch (_) {}
  };

  const handleVerifyOtp = async () => {
    clearAuthError();
    try {
      await verifyEmailOtp(otp);
      if (navigation?.navigate) {
        navigation.navigate('MainTabs');
      }
    } catch (_) {}
  };

  const handleResend = async () => {
    if (countdown > 0 || authLoading) return;
    clearAuthError();
    try {
      await resendEmailOtp();
      setCountdown(30);
      setOtp('');
    } catch (_) {}
  };

  const handleBackToInput = () => {
    clearAuthError();
    setStep('INPUT');
    setOtp('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_THEME.bg} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.modalCard}>
          {/* Logo & Header */}
          <View style={styles.headerBox}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../assets/nmims-logo.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>
              {step === 'INPUT' ? 'Student Login' : 'Enter Verification Code'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'INPUT'
                ? 'NMIMS Canteen Student Portal'
                : `Enter the 6-digit code sent to ${email}`}
            </Text>
            <Text style={styles.badgeText}>Indore Campus</Text>
          </View>

          {/* Error Message Banner */}
          {authError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          ) : null}

          {/* STEP 1: Enter Email */}
          {step === 'INPUT' ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NMIMS Student Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="student@nmims.edu.in"
                  placeholderTextColor={DARK_THEME.textMuted}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (authError) clearAuthError();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, authLoading && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={authLoading}
                activeOpacity={0.88}
              >
                {authLoading ? (
                  <View style={styles.btnRow}>
                    <ActivityIndicator size="small" color={DARK_THEME.white} />
                    <Text style={styles.primaryBtnText}>Sending OTP...</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryBtnText}>Send Verification Code 📩</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.helperText}>
                A secure 6-digit OTP will be delivered directly to your inbox.
              </Text>
            </View>
          ) : (
            /* STEP 2: Enter 6-digit OTP */
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>6-Digit Code</Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="• • • • • •"
                  placeholderTextColor={DARK_THEME.textMuted}
                  value={otp}
                  onChangeText={(t) => {
                    setOtp(t);
                    if (authError) clearAuthError();
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, authLoading && styles.btnDisabled]}
                onPress={handleVerifyOtp}
                disabled={authLoading}
                activeOpacity={0.88}
              >
                {authLoading ? (
                  <View style={styles.btnRow}>
                    <ActivityIndicator size="small" color={DARK_THEME.white} />
                    <Text style={styles.primaryBtnText}>Verifying...</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryBtnText}>Verify & Proceed 🔓</Text>
                )}
              </TouchableOpacity>

              {/* Resend OTP Section */}
              <View style={styles.resendSection}>
                {countdown > 0 ? (
                  <Text style={styles.resendCountdown}>
                    Resend code in{' '}
                    <Text style={{ color: DARK_THEME.primaryRed, fontWeight: '700' }}>
                      {countdown}s
                    </Text>
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResend}
                    disabled={authLoading}
                    style={styles.resendBtn}
                  >
                    <Text style={styles.resendBtnText}>🔄 Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={handleBackToInput}
                disabled={authLoading}
                style={styles.backBtn}
              >
                <Text style={styles.backBtnText}>← Change Email</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: DARK_THEME.cardBg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: DARK_THEME.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoImg: {
    width: 48,
    height: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: DARK_THEME.white,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: DARK_THEME.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: DARK_THEME.primaryRed,
    backgroundColor: 'rgba(255, 77, 77, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.3)',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  form: {
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: DARK_THEME.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: DARK_THEME.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
    color: DARK_THEME.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  otpInput: {
    backgroundColor: DARK_THEME.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    color: DARK_THEME.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 10,
  },
  primaryBtn: {
    backgroundColor: DARK_THEME.primaryRed,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  primaryBtnText: {
    color: DARK_THEME.white,
    fontSize: 15,
    fontWeight: '800',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helperText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 16,
  },
  resendSection: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 6,
  },
  resendCountdown: {
    color: DARK_THEME.textMuted,
    fontSize: 13,
  },
  resendBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resendBtnText: {
    color: DARK_THEME.white,
    fontSize: 13,
    fontWeight: '600',
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 8,
  },
  backBtnText: {
    color: DARK_THEME.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
});
