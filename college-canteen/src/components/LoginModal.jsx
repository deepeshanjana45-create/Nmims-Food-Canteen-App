// src/components/LoginModal.jsx — Student Login Modal for NMIMS Canteen App

import React, { useState } from 'react';
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
  const { loginModalVisible, closeLoginModal, login, loginReason } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleManualLogin = () => {
    login({
      name: email ? email.split('@')[0] : 'Student',
      sapId: '70012023045',
      branch: 'B.Tech Student',
      email: email || 'student@nmims.edu.in',
      campus: 'Indore Campus',
    });
  };

  const handleQuickDemoLogin = () => {
    login();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={loginModalVisible}
      onRequestClose={closeLoginModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={closeLoginModal}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* Logo & Header */}
          <View style={styles.headerBox}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../assets/nmims-logo.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Student Login</Text>
            <Text style={styles.subtitle}>{loginReason}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NMIMS SAP ID / Email</Text>
              <TextInput
                style={styles.input}
                placeholder="70012023045 or student@nmims.edu.in"
                placeholderTextColor={DARK_THEME.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={DARK_THEME.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Red Log In Button */}
            <TouchableOpacity style={styles.redLoginBtn} onPress={handleManualLogin}>
              <Text style={styles.redLoginBtnText}>Log In & Continue 🔓</Text>
            </TouchableOpacity>

            {/* Quick Demo Login Button */}
            <TouchableOpacity style={styles.demoLoginBtn} onPress={handleQuickDemoLogin}>
              <Text style={styles.demoLoginBtnText}>⚡ Quick Student Demo Login</Text>
            </TouchableOpacity>
          </View>
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
    position: 'relative',
  },

  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    color: DARK_THEME.white,
    fontSize: 16,
    fontWeight: '800',
  },

  headerBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: DARK_THEME.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginBottom: 12,
  },
  logoImg: {
    width: '85%',
    height: '85%',
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: DARK_THEME.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: DARK_THEME.primaryRed,
    fontWeight: '700',
    textAlign: 'center',
  },

  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: DARK_THEME.textMuted,
  },
  input: {
    backgroundColor: DARK_THEME.inputBg,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
    color: DARK_THEME.white,
    fontSize: 14,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
  },

  redLoginBtn: {
    backgroundColor: DARK_THEME.primaryRed,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  redLoginBtnText: {
    color: DARK_THEME.white,
    fontSize: 16,
    fontWeight: '900',
  },

  demoLoginBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
  },
  demoLoginBtnText: {
    color: DARK_THEME.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
