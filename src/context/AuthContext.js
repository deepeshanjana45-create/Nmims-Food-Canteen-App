// src/context/AuthContext.js

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';

import { API_BASE_URL } from '../config/apiConfig';

const STORAGE_KEY = 'nmims_student_auth_session';

function networkErrorMessage(error, fallback) {
  const message = error?.message || '';
  const isNetwork =
    error?.name === 'TypeError' ||
    /failed to fetch|network request failed|networkerror|timed out/i.test(
      message
    );

  if (isNetwork) {
    return 'Cannot reach the OTP server. On a phone, use the same Wi-Fi as this computer, keep "npm run server" running, and rebuild the app after API URL changes.';
  }

  return message || fallback;
}

const defaultAuthValue = {
  isLoggedIn: false,
  user: null,
  initializing: true,
  authLoading: false,
  authError: null,
  loginModalVisible: false,
  loginReason: 'Log in to place your canteen order',
  openLoginModal: () => { },
  closeLoginModal: () => { },
  clearAuthError: () => { },
  sendEmailOtp: async () => { },
  verifyEmailOtp: async () => { },
  resendEmailOtp: async () => { },
  logout: async () => { },
  requireAuth: () => { },
};

const AuthContext = createContext(defaultAuthValue);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [loginReason, setLoginReason] = useState(
    'Log in to access all features'
  );

  const tempEmailRef = useRef('');

  // Restore saved login session
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY);

        if (saved) {
          const parsed = JSON.parse(saved);

          if (parsed?.user) {
            setUser(parsed.user);
            setIsLoggedIn(true);
          }
        }
      }
    } catch (error) {
      console.log('Session restore error:', error);
    } finally {
      setInitializing(false);
    }
  }, []);

  const openLoginModal = (
    reason = 'Log in to place your canteen order'
  ) => {
    setLoginReason(reason);
    setAuthError(null);
    setLoginModalVisible(true);
  };

  const closeLoginModal = () => {
    setLoginModalVisible(false);
    setPendingAction(null);
    setAuthError(null);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  // SEND OTP
  const sendEmailOtp = async (email) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const cleanEmail = (email || '').trim().toLowerCase();

      if (
        !cleanEmail ||
        !cleanEmail.includes('@') ||
        !cleanEmail.includes('.')
      ) {
        throw new Error('Please enter a valid email address.');
      }

      console.log('Sending OTP to:', cleanEmail);
      console.log('API URL:', API_BASE_URL);

      const response = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to send OTP.'
        );
      }

      tempEmailRef.current = cleanEmail;

      return {
        success: true,
        email: cleanEmail,
        otp: data.otp,
        message: data.message,
      };
    } catch (error) {
      console.error('Send OTP error:', error);

      setAuthError(networkErrorMessage(error, 'Failed to send OTP.'));

      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // VERIFY OTP
  const verifyEmailOtp = async (otpCode) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const cleanOtp = (otpCode || '').trim();
      const email = tempEmailRef.current;

      if (!email) {
        throw new Error(
          'No active OTP session. Please request a new OTP.'
        );
      }

      if (!cleanOtp || cleanOtp.length !== 6) {
        throw new Error(
          'Please enter the 6-digit OTP.'
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            otp: cleanOtp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'OTP verification failed.'
        );
      }

      const authenticatedStudent = data.user;

      // Save session
      try {
        if (
          typeof window !== 'undefined' &&
          window.localStorage
        ) {
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              user: authenticatedStudent,
              token: data.token,
            })
          );
        }
      } catch (error) {
        console.log('Session save error:', error);
      }

      setUser(authenticatedStudent);
      setIsLoggedIn(true);
      setLoginModalVisible(false);
      setAuthError(null);

      // Execute pending action after login
      if (pendingAction) {
        const action = pendingAction;

        setPendingAction(null);

        setTimeout(() => {
          if (typeof action === 'function') {
            action();
          }
        }, 300);
      }

      return authenticatedStudent;
    } catch (error) {
      console.error('Verify OTP error:', error);

      setAuthError(networkErrorMessage(error, 'OTP verification failed.'));

      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // RESEND OTP
  const resendEmailOtp = async () => {
    if (!tempEmailRef.current) {
      throw new Error(
        'Missing email to resend OTP.'
      );
    }

    return sendEmailOtp(tempEmailRef.current);
  };

  // LOGOUT
  const logout = async () => {
    try {
      if (
        typeof window !== 'undefined' &&
        window.localStorage
      ) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.log('Logout storage error:', error);
    }

    tempEmailRef.current = '';

    setUser(null);
    setIsLoggedIn(false);
    setAuthError(null);
    setLoginModalVisible(false);
    setPendingAction(null);
  };

  // REQUIRE LOGIN
  const requireAuth = (
    actionCallback,
    reason = 'Please log in to place your order'
  ) => {
    if (isLoggedIn) {
      if (typeof actionCallback === 'function') {
        actionCallback();
      }
    } else {
      setPendingAction(() => actionCallback);
      openLoginModal(reason);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        initializing,
        authLoading,
        authError,
        loginModalVisible,
        loginReason,

        openLoginModal,
        closeLoginModal,
        clearAuthError,

        sendEmailOtp,
        verifyEmailOtp,
        resendEmailOtp,

        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  return context || defaultAuthValue;
}
