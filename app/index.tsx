import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Lock, Mail, ArrowRight } from "lucide-react-native";
import { useAuth } from "../src/context/AuthContext";
import { getFriendlyAuthErrorMessage } from "../src/utils/authErrors";

export default function LandingScreen() {
  const router = useRouter();
  const { loginWithEmail, registerWithEmail } = useAuth();

  const shiftY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(shiftY, {
        toValue: -140,
        duration: e.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(shiftY, {
        toValue: 0,
        duration: e.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );

  const handleAuthSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    setErrorMessage("");
    setLoading(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(email.trim(), password);
      }
      router.replace("/splits");
    } catch (e: any) {
      setErrorMessage(getFriendlyAuthErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Animated.View
          style={[
            { flex: 1, justifyContent: "center" },
            { transform: [{ translateY: shiftY }] },
          ]}
          className="px-6"
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingVertical: 16,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
              {/* Top Logo & App Branding */}
              <View className="items-center mb-5">
                <View className="w-20 h-20 rounded-2xl bg-white border border-slate-200 items-center justify-center mb-3 overflow-hidden p-2">
                  <Image
                    source={require("../assets/app-logo.png")}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                </View>
                <Text className="text-slate-900 text-2xl font-black tracking-tight">
                  WORKOUTS
                </Text>
                <Text className="text-slate-500 text-xs font-medium mt-0.5">
                  Splits & Workouts planner
                </Text>
              </View>

              {/* Form Card */}
              <View className="bg-white border border-slate-200 rounded-3xl p-6">
                {/* Login / Register Toggle Tabs */}
                <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-5 border border-slate-200">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setMode("login");
                      setErrorMessage("");
                    }}
                    className={`flex-1 py-2.5 rounded-xl items-center ${
                      mode === "login" ? "bg-white" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`font-bold text-sm ${
                        mode === "login" ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      Log In
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setMode("register");
                      setErrorMessage("");
                    }}
                    className={`flex-1 py-2.5 rounded-xl items-center ${
                      mode === "register" ? "bg-white" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`font-bold text-sm ${
                        mode === "register" ? "text-slate-900" : "text-slate-500"
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
                  <View
                    className={`flex-row items-center rounded-xl px-3.5 h-12 border ${
                      focusedField === "email"
                        ? "border-blue-500 bg-white"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <Mail
                      size={18}
                      color={focusedField === "email" ? "#2563EB" : "#94A3B8"}
                    />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="athlete@example.com"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={[
                        {
                          flex: 1,
                          marginLeft: 10,
                          fontSize: 15,
                          padding: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                          paddingLeft: 0,
                          paddingRight: 0,
                          textAlignVertical: "center",
                          includeFontPadding: false,
                        },
                        Platform.OS === "web"
                          ? ({ outline: "none" } as any)
                          : undefined,
                      ]}
                      className="text-slate-900 font-medium"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-5">
                  <Text className="text-slate-700 text-xs font-bold uppercase mb-1.5 ml-1 tracking-wider">
                    Password
                  </Text>
                  <View
                    className={`flex-row items-center rounded-xl px-3.5 h-12 border ${
                      focusedField === "password"
                        ? "border-blue-500 bg-white"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <Lock
                      size={18}
                      color={focusedField === "password" ? "#2563EB" : "#94A3B8"}
                    />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry
                      autoCapitalize="none"
                      style={[
                        {
                          flex: 1,
                          marginLeft: 10,
                          fontSize: 15,
                          padding: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                          paddingLeft: 0,
                          paddingRight: 0,
                          textAlignVertical: "center",
                          includeFontPadding: false,
                        },
                        Platform.OS === "web"
                          ? ({ outline: "none" } as any)
                          : undefined,
                      ]}
                      className="text-slate-900 font-medium"
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleAuthSubmit}
                  disabled={loading}
                  className="bg-blue-600 py-3.5 rounded-xl flex-row items-center justify-center"
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text className="text-white font-bold text-base mr-2">
                        {mode === "login" ? "Sign In" : "Create Account"}
                      </Text>
                      <ArrowRight size={18} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    );
  }

