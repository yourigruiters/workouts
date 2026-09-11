import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { LoadingOverlay } from '../components/LoadingOverlay';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(action: () => Promise<T>, message?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [busyCount, setBusyCount] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>('Loading...');

  const showLoading = useCallback((message: string = 'Loading...') => {
    setLoadingMessage(message);
    setBusyCount((prev) => prev + 1);
  }, []);

  const hideLoading = useCallback(() => {
    setBusyCount((prev) => Math.max(0, prev - 1));
  }, []);

  const withLoading = useCallback(
    async <T,>(action: () => Promise<T>, message: string = 'Saving changes...'): Promise<T> => {
      setLoadingMessage(message);
      setBusyCount((prev) => prev + 1);
      try {
        return await action();
      } finally {
        setBusyCount((prev) => Math.max(0, prev - 1));
      }
    },
    []
  );

  const isLoading = busyCount > 0;

  const value = useMemo(
    () => ({
      isLoading,
      loadingMessage,
      showLoading,
      hideLoading,
      withLoading,
    }),
    [isLoading, loadingMessage, showLoading, hideLoading, withLoading]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay visible={isLoading} message={loadingMessage} />
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
