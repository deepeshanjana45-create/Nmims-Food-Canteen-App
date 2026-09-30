// src/context/AuthContext.js — Authentication context for NMIMS Student Portal

import React, { createContext, useContext, useState } from 'react';

const defaultAuthValue = {
  isLoggedIn: false,
  user: null,
  loginModalVisible: false,
  loginReason: 'Log in to place your canteen order',
  openLoginModal: () => {},
  closeLoginModal: () => {},
  login: () => {},
  logout: () => {},
  requireAuth: (actionCallback) => actionCallback && actionCallback(),
};

const AuthContext = createContext(defaultAuthValue);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [loginReason, setLoginReason] = useState('Log in to access all features');

  const openLoginModal = (reason = 'Log in to place your canteen order') => {
    setLoginReason(reason);
    setLoginModalVisible(true);
  };

  const closeLoginModal = () => {
    setLoginModalVisible(false);
    setPendingAction(null);
  };

  const login = (userData = null) => {
    const defaultUser = {
      name: 'Rahul Sharma',
      sapId: '70012023045',
      branch: 'B.Tech Computer Science',
      year: '3rd Year',
      email: 'rahul.sharma@nmims.edu.in',
      campus: 'Indore Campus',
    };
    const loggedInUser = userData || defaultUser;
    setUser(loggedInUser);
    setIsLoggedIn(true);
    setLoginModalVisible(false);

    // Execute pending action if any (e.g. place order)
    if (pendingAction) {
      setTimeout(() => {
        pendingAction();
        setPendingAction(null);
      }, 300);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const requireAuth = (actionCallback, reason = 'Please log in to place your order') => {
    if (isLoggedIn) {
      if (actionCallback) actionCallback();
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
        loginModalVisible,
        loginReason,
        openLoginModal,
        closeLoginModal,
        login,
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
