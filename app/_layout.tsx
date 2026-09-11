import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingProvider } from '../src/context/LoadingContext';
import { AuthProvider } from '../src/context/AuthContext';
import { WorkoutProvider } from '../src/context/WorkoutContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LoadingProvider>
        <AuthProvider>
          <WorkoutProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#F8FAFC' },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="splits" />
              <Stack.Screen name="split/[id]" />
              <Stack.Screen name="workout/[id]" />
            </Stack>
          </WorkoutProvider>
        </AuthProvider>
      </LoadingProvider>
    </SafeAreaProvider>
  );
}
