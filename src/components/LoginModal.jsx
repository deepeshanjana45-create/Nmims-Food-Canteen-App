// src/components/LoginModal.jsx — Email Authentication Modal

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
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

export default function LoginModal() {
  const {
    loginModalVisible,
    closeLoginModal,
    loginReason,
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

  // 30-second countdown timer for resend OTP cooldown
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
      const res = await sendEmailOtp(email);
      setStep('OTP');
      setCountdown(30);
      if (res?.otp) {
        setOtp(String(res.otp));
      } else {
        setOtp('');
      }
    } catch (_) {}
  };

  const handleVerifyOtp = async () => {
    clearAuthError();
    try {
      await verifyEmailOtp(otp);
      handleClose();
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

  const handleClose = () => {
    clearAuthError();
    setStep('INPUT');
    setOtp('');
    closeLoginModal();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={loginModalVisible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
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
                {step === 'INPUT' ? 'Student Verification' : 'Enter Verification Code'}
              </Text>
              <Text style={styles.subtitle}>
                {step === 'INPUT'
                  ? loginReason
                  : `Enter the 6-digit code sent to ${email}`}
              </Text>
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
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: DARK_THEME.cardBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
    maxHeight: '90%',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    color: DARK_THEME.white,
    fontSize: 14,
    fontWeight: '700',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: DARK_THEME.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoImg: {
    width: 44,
    height: 44,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: DARK_THEME.white,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: DARK_THEME.primaryRed,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 16,
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
    shadowColor: DARK_THEME.primaryRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  primaryBtnText: {
    color: DARK_THEME.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
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
