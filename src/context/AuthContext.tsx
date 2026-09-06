import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types/user';
import { firebaseService } from '../services/firebaseService';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isFirebaseReady: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>({
    uid: 'guest-athlete',
    email: 'athlete@workout.app',
    displayName: 'Athlete',
    isGuest: true,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (firebaseService.isConfigured) {
      const unsub = firebaseService.onAuthChanged((fbUser) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Athlete',
            isGuest: false,
          });
        }
      });
      return () => unsub && unsub();
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (firebaseService.isConfigured) {
        const fbUser = await firebaseService.login(email, pass);
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || email.split('@')[0],
            isGuest: false,
          });
        }
      } else {
        // Mock fallback login for testing before Firebase .env is populated
        setUser({
          uid: 'mock-user-1',
          email,
          displayName: email.split('@')[0],
          isGuest: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (firebaseService.isConfigured) {
        const fbUser = await firebaseService.register(email, pass);
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || email.split('@')[0],
            isGuest: false,
          });
        }
      } else {
        setUser({
          uid: 'mock-user-' + Date.now(),
          email,
          displayName: email.split('@')[0],
          isGuest: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = () => {
    setUser({
      uid: 'guest-' + Date.now(),
      email: 'guest@workout.app',
      displayName: 'Guest Athlete',
      isGuest: true,
    });
  };

  const logout = async () => {
    if (firebaseService.isConfigured) {
      await firebaseService.logout();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isFirebaseReady: firebaseService.isConfigured,
        loginWithEmail,
        registerWithEmail,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
