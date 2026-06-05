import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Animated, Image, StyleSheet, KeyboardAvoidingView, Platform, StatusBar, Keyboard, LayoutAnimation } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONT, withAlpha, moderateScale, fontScale } from "../../src/utils/constants";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import AnimatedBackground from "../../src/components/AnimatedBackground";
import PressableBounce from "../../src/components/PressableBounce";
import BouncyInput from "../../src/components/BouncyInput";

export default function LoginScreen() {
  const router = useRouter();
  const { login, error, clearError } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const ms = moderateScale;
  const fs = fontScale;

  const iconAnim = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(40)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const errorTranslate = useRef(new Animated.Value(-40)).current;
  const [showError, setShowError] = useState(false);
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const err = error || validationError;
    if (err) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowError(true);
      errorOpacity.setValue(0);
      errorTranslate.setValue(-40);
      Animated.parallel([
        Animated.timing(errorOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(errorTranslate, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
      ]).start();
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(errorOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(errorTranslate, { toValue: 40, duration: 200, useNativeDriver: true }),
        ]).start(() => {
          clearError();
          setValidationError("");
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setShowError(false);
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, validationError]);

  useFocusEffect(
    useCallback(() => {
      iconAnim.setValue(0);
      cardOpacity.setValue(0);
      cardTranslate.setValue(40);
      glowOpacity.setValue(0);

      Animated.spring(iconAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardTranslate, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
      ]).start();
      Animated.timing(glowOpacity, { toValue: 1, duration: 500, delay: 350, useNativeDriver: true }).start();
    }, [])
  );

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    flex: {
      flex: 1,
    },
    overlay: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: ms(24),
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: ms(24),
      padding: ms(28),
      borderWidth: 1,
      borderColor: colors.border,
    },
    glowBubble: {
      position: "absolute",
      top: ms(14),
      left: ms(14),
      width: "100%",
      height: "100%",
      borderRadius: ms(24),
      backgroundColor: "#1E40AF",
    },
    header: {
      alignItems: "center",
      marginBottom: ms(28),
    },
    icon: {
      width: ms(94),
      height: ms(80),
      marginBottom: ms(16),
    },
    title: {
      fontSize: fs(28),
      fontFamily: FONT.extraBold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: fs(15),
      fontFamily: FONT.regular,
      color: colors.textSecondary,
      marginTop: ms(4),
    },
    form: {
      gap: ms(14),
    },
    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: withAlpha(colors.danger, 0.08),
      borderRadius: ms(12),
      padding: ms(12),
      gap: ms(8),
      borderWidth: 1,
      borderColor: withAlpha(colors.danger, 0.15),
    },
    errorText: {
      fontSize: fs(14),
      fontFamily: FONT.medium,
      color: colors.danger,
      flex: 1,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: ms(12),
      paddingHorizontal: ms(14),
      minHeight: ms(50),
      borderWidth: 1,
      borderColor: colors.border,
    },
    input: {
      flex: 1,
      fontSize: fs(15),
      fontFamily: FONT.regular,
      color: colors.text,
    },
    loginBtn: {
      backgroundColor: colors.text,
      borderRadius: ms(12),
      minHeight: ms(50),
      justifyContent: "center",
      alignItems: "center",
      marginTop: ms(4),
    },
    loginBtnText: {
      fontSize: fs(16),
      fontFamily: FONT.semiBold,
      color: colors.white,
    },
    registerLink: {
      alignItems: "center",
      paddingVertical: ms(12),
      marginTop: ms(4),
    },
    registerText: {
      fontSize: fs(14),
      fontFamily: FONT.regular,
      color: colors.textSecondary,
    },
    registerTextBold: {
      color: colors.text,
      fontFamily: FONT.semiBold,
    },
  }), [colors]);

  const handleLogin = async () => {
    clearError();
    setValidationError("");
    if (!email.trim()) { setValidationError("Email is required"); return; }
    if (!password.trim()) { setValidationError("Password is required"); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
      Keyboard.dismiss();
      router.replace("/(tabs)/dashboard");
    } catch (_) {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground colors={["#3B82F6", "#8B5CF6", "#06B6D4"]}>
        <SafeAreaView style={styles.overlay}>
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.content}>
              <Animated.View style={{ opacity: iconAnim, transform: [{ scale: iconAnim }], alignSelf: "center", marginTop: ms(8) }}>
                <Image source={require("../../assets/taskmetrics-icon.png")} style={styles.icon} resizeMode="contain" />
              </Animated.View>
              <Animated.View style={{ opacity: cardOpacity, transform: [{ translateY: cardTranslate }] }}>
                <View>
                  <Animated.View style={[styles.glowBubble, { opacity: glowOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.15] }) }]} />
                  <View style={styles.card}>
                  <View style={styles.header}>
                    <Text style={styles.title}>Welcome back</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                  </View>

                  <View style={styles.form}>
                    {showError ? (
                      <Animated.View style={[styles.errorBox, { opacity: errorOpacity, transform: [{ translateX: errorTranslate }] }]}>
                        <Ionicons name="alert-circle" size={ms(18)} color={colors.danger} />
                        <Text style={styles.errorText}>{validationError || error}</Text>
                      </Animated.View>
                    ) : null}

                    <BouncyInput style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={colors.textLight}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                      />
                    </BouncyInput>

                    <BouncyInput style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={colors.textLight}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoComplete="current-password"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={fs(20)} color={colors.textLight} />
                      </TouchableOpacity>
                    </BouncyInput>

                    <PressableBounce style={[styles.loginBtn, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
                      <Text style={styles.loginBtnText}>{loading ? "Signing in..." : "Sign In"}</Text>
                    </PressableBounce>
                  </View>
                </View>
                </View>

                <PressableBounce style={styles.registerLink} onPress={() => router.push("/(auth)/register")}>
                  <Text style={styles.registerText}>
                    Don't have an account?{" "}
                    <Text style={styles.registerTextBold}>Create Account</Text>
                  </Text>
                </PressableBounce>
              </Animated.View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </AnimatedBackground>
    </View>
  );
}
