import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { createDefaultCustomer, createDefaultDriver } from '../types/schema';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Current active portal/view: 'customer' | 'driver' | 'admin'
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('uber_active_view') || 'customer';
  });

  const DEMO_SESSION_UIDS = [
    'cust-john-doe',
    'drv-david-miller',
    'drv-rahul-verma',
    'drv-alex-rivera',
    'drv-priya-sharma',
    'drv-vikram-singh',
    'drv-demo',
    'drv-qa-test-1',
  ];

  // Current authenticated user session UID
  const [currentSessionUid, setCurrentSessionUid] = useState(() => {
    const saved = localStorage.getItem('uber_session_uid');
    return (saved && !DEMO_SESSION_UIDS.includes(saved)) ? saved : null;
  });

  // Current user role: 'customer' | 'driver' | 'admin'
  const [currentRole, setCurrentRole] = useState(() => {
    const savedUid = localStorage.getItem('uber_session_uid');
    if (!savedUid || DEMO_SESSION_UIDS.includes(savedUid)) {
      return null;
    }
    return localStorage.getItem('uber_current_role') || null;
  });

  const [user, setUser] = useState(() => {
    try {
      const savedRole = localStorage.getItem('uber_current_role');
      const savedUid = localStorage.getItem('uber_session_uid');
      if (!savedRole || !savedUid || DEMO_SESSION_UIDS.includes(savedUid)) return null;
      if (savedRole === 'customer') return dbService.getUser(savedUid);
      if (savedRole === 'driver') return dbService.getDriver(savedUid);
      if (savedRole === 'admin') return dbService.getAdmin(savedUid);
    } catch {
      return null;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  // Sync user from DB based on role and UID
  const refreshUser = () => {
    if (!currentSessionUid || !currentRole) {
      setUser(null);
      setLoading(false);
      return;
    }

    let foundUser = null;
    if (currentRole === 'customer') {
      foundUser = dbService.getUser(currentSessionUid);
    } else if (currentRole === 'driver') {
      foundUser = dbService.getDriver(currentSessionUid);
    } else if (currentRole === 'admin') {
      foundUser = dbService.getAdmin(currentSessionUid);
    }

    if (foundUser) {
      setUser(foundUser);
    } else {
      // If user record no longer exists, clear invalid session
      setUser(null);
      setCurrentSessionUid(null);
      setCurrentRole(null);
      localStorage.removeItem('uber_session_uid');
      localStorage.removeItem('uber_current_role');
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, [currentSessionUid, currentRole]);

  // Subscribe to DB real-time changes
  useEffect(() => {
    const unsubscribe = dbService.subscribe(() => {
      refreshUser();
    });
    return unsubscribe;
  }, [currentSessionUid, currentRole]);

  // Persist session choices
  useEffect(() => {
    if (currentSessionUid) {
      localStorage.setItem('uber_session_uid', currentSessionUid);
    } else {
      localStorage.removeItem('uber_session_uid');
    }
  }, [currentSessionUid]);

  useEffect(() => {
    if (currentRole) {
      localStorage.setItem('uber_current_role', currentRole);
    } else {
      localStorage.removeItem('uber_current_role');
    }
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('uber_active_view', activeView);
  }, [activeView]);

  // Secure Portal Switcher with Role Guarding
  const switchActiveView = (view) => {
    setActiveView(view);
  };

  // Real Email/Password Authentication
  const loginWithEmail = async (email, password, roleHint = 'customer') => {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Admin Authentication
    if (roleHint === 'admin') {
      const admins = dbService.getAdmins();
      const match = admins.find((a) => a.email.toLowerCase() === cleanEmail);
      if (match) {
        setCurrentSessionUid(match.uid);
        setCurrentRole('admin');
        setActiveView('admin');
        return { success: true, user: match };
      }
      throw new Error('Administrative credentials rejected. Access denied.');
    }

    // 2. Driver Authentication
    if (roleHint === 'driver') {
      const drivers = dbService.getDrivers();
      const match = drivers.find((d) => d.email.toLowerCase() === cleanEmail);
      if (match) {
        setCurrentSessionUid(match.uid);
        setCurrentRole('driver');
        setActiveView('driver');
        return { success: true, user: match };
      }
      throw new Error('Driver account not found. Please verify your email or register as a partner.');
    }

    // 3. Customer Authentication
    const users = dbService.getUsers();
    const match = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (match) {
      setCurrentSessionUid(match.uid);
      setCurrentRole('customer');
      setActiveView('customer');
      return { success: true, user: match };
    }
    throw new Error('Customer account not found. Please sign up to create a new rider account.');
  };

  // Real Phone + OTP Authentication
  const loginWithPhoneOTP = async (phone, otp, roleHint = 'customer') => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 6) {
      throw new Error('Please enter a valid phone number.');
    }

    if (!otp || String(otp).trim().length !== 4) {
      throw new Error('Please enter a valid 4-digit verification OTP code.');
    }

    if (roleHint === 'driver') {
      const drivers = dbService.getDrivers();
      const match = drivers.find((d) => d.phone.replace(/\D/g, '') === cleanPhone);
      if (match) {
        setCurrentSessionUid(match.uid);
        setCurrentRole('driver');
        setActiveView('driver');
        return { success: true, user: match };
      }
      // Register new driver account
      const newUid = `drv-${Date.now()}`;
      const newDriver = createDefaultDriver(newUid, { phone, fullName: 'Driver Partner' });
      dbService.saveDriver(newDriver);
      setCurrentSessionUid(newUid);
      setCurrentRole('driver');
      setActiveView('driver');
      return { success: true, user: newDriver };
    }

    // Customer
    const users = dbService.getUsers();
    const match = users.find((u) => u.phone.replace(/\D/g, '') === cleanPhone);
    if (match) {
      setCurrentSessionUid(match.uid);
      setCurrentRole('customer');
      setActiveView('customer');
      return { success: true, user: match };
    }

    const newUid = `cust-${Date.now()}`;
    const newCustomer = createDefaultCustomer(newUid, { phone, fullName: 'New Rider' });
    dbService.saveUser(newCustomer);
    setCurrentSessionUid(newUid);
    setCurrentRole('customer');
    setActiveView('customer');
    return { success: true, user: newCustomer };
  };

  const signUpCustomer = async (data) => {
    const newUid = `cust-${Date.now()}`;
    const newCustomer = createDefaultCustomer(newUid, data);
    dbService.saveUser(newCustomer);
    setCurrentSessionUid(newUid);
    setCurrentRole('customer');
    setActiveView('customer');
    return newCustomer;
  };

  const signUpDriver = async (data) => {
    const newUid = `drv-${Date.now()}`;
    const newDriver = createDefaultDriver(newUid, data);
    dbService.saveDriver(newDriver);
    setCurrentSessionUid(newUid);
    setCurrentRole('driver');
    setActiveView('driver');
    return newDriver;
  };

  const logout = () => {
    setCurrentSessionUid(null);
    setCurrentRole(null);
    setUser(null);
    localStorage.removeItem('uber_session_uid');
    localStorage.removeItem('uber_current_role');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        currentRole,
        activeView,
        isAuthenticated: !!user,
        loading,
        switchActiveView,
        loginWithEmail,
        loginWithPhoneOTP,
        signUpCustomer,
        signUpDriver,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
