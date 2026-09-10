import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types/user';
import { firebaseService } from '../services/firebaseService';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isFirebaseReady: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (firebaseService.isConfigured) {
      const unsub = firebaseService.onAuthChanged(async (fbUser) => {
        if (fbUser) {
          const profile = await firebaseService.getUserProfile(fbUser.uid);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email || profile?.email || '',
            displayName: profile?.displayName || fbUser.displayName || fbUser.email?.split('@')[0] || 'Athlete',
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
      return () => unsub && unsub();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const fbUser = await firebaseService.login(email, pass);
      if (fbUser) {
        const profile = await firebaseService.getUserProfile(fbUser.uid);
        setUser({
          uid: fbUser.uid,
          email: fbUser.email || email,
          displayName: profile?.displayName || fbUser.displayName || email.split('@')[0],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, displayName?: string) => {
    setIsLoading(true);
    try {
      const fbUser = await firebaseService.register(email, pass, displayName);
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email || email,
          displayName: displayName?.trim() || fbUser.displayName || email.split('@')[0],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await firebaseService.logout();
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
