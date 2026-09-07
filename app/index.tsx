import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lock, Mail, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../src/context/AuthContext';

export default function LandingScreen() {
  const router = useRouter();
  const { loginWithEmail, registerWithEmail } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAuthSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setErrorMessage('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(email.trim(), password);
      }
      router.replace('/splits');
    } catch (e: any) {
      setErrorMessage(e.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          className="px-6 py-8"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Logo & App Branding */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-3xl bg-white border border-slate-200 items-center justify-center mb-4 shadow-sm overflow-hidden p-2">
              <Image
                source={require('../assets/app-logo.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-slate-900 text-3xl font-black tracking-tight">
              WORKOUTS
            </Text>
            <Text className="text-slate-500 text-sm font-medium mt-1">
              Precision Splits & Routine Planner
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            {/* Login / Register Toggle Tabs */}
            <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2.5 rounded-xl items-center ${
                  mode === 'login' ? 'bg-white shadow-sm' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`font-bold text-sm ${
                    mode === 'login' ? 'text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Log In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setMode('register');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2.5 rounded-xl items-center ${
                  mode === 'register' ? 'bg-white shadow-sm' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`font-bold text-sm ${
                    mode === 'register' ? 'text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {Boolean(errorMessage) && (
              <View className="bg-rose-50 border border-rose-200 p-3 rounded-xl mb-4">
                <Text className="text-rose-600 text-xs font-semibold text-center">
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-slate-700 text-xs font-bold uppercase mb-1.5 ml-1 tracking-wider">
                Email Address
              </Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                <Mail size={18} color="#94A3B8" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="athlete@example.com"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 text-slate-900 ml-2.5 font-medium text-sm"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-slate-700 text-xs font-bold uppercase mb-1.5 ml-1 tracking-wider">
                Password
              </Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                <Lock size={18} color="#94A3B8" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  className="flex-1 text-slate-900 ml-2.5 font-medium text-sm"
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAuthSubmit}
              disabled={loading}
              className="bg-blue-600 py-3.5 rounded-xl flex-row items-center justify-center shadow-sm"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text className="text-white font-bold text-base mr-2">
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
