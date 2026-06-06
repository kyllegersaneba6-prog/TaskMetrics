import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Animated, Image, StyleSheet, KeyboardAvoidingView, ScrollView, Keyboard, LayoutAnimation } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONT, withAlpha, moderateScale, fontScale } from "../../src/utils/constants";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import PressableBounce from "../../src/components/PressableBounce";
import BouncyInput from "../../src/components/BouncyInput";
import AuthBubbleOverlay from "../../src/components/AuthBubbleOverlay";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, error, clearError } = useAuth();
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
        Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(cardTranslate, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
      ]).start();
      Animated.timing(glowOpacity, { toValue: 1, duration: 300, delay: 200, useNativeDriver: true }).start();
    }, [])
  );

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    overlay: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: ms(24),
      paddingVertical: ms(40),
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
      backgroundColor: "#5B21B6",
    },
    header: {
      marginBottom: ms(24),
    },
    icon: {
      width: ms(94),
      height: ms(80),
      marginBottom: ms(12),
    },
    backRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: ms(16),
    },
    backBtn: {
      width: ms(36),
      height: ms(36),
      borderRadius: ms(10),
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: ms(12),
    },
    title: {
      fontSize: fs(24),
      fontFamily: FONT.extraBold,
      color: colors.text,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: fs(15),
      fontFamily: FONT.regular,
      color: colors.textSecondary,
      marginTop: ms(2),
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
    registerBtn: {
      backgroundColor: colors.text,
      borderRadius: ms(12),
      minHeight: ms(50),
      justifyContent: "center",
      alignItems: "center",
      marginTop: ms(4),
    },
    registerBtnText: {
      fontSize: fs(16),
      fontFamily: FONT.semiBold,
      color: colors.white,
    },
    loginLink: {
      alignItems: "center",
      paddingVertical: ms(12),
      marginTop: ms(4),
    },
    loginText: {
      fontSize: fs(14),
      fontFamily: FONT.regular,
      color: colors.textSecondary,
    },
    loginTextBold: {
      color: colors.text,
      fontFamily: FONT.semiBold,
    },
  }), [colors]);

  const handleRegister = async () => {
    clearError();
    setValidationError("");
    if (!name.trim()) { setValidationError("Name is required"); return; }
    if (!email.trim()) { setValidationError("Email is required"); return; }
    if (!password.trim()) { setValidationError("Password is required"); return; }
    if (password.length < 6) { setValidationError("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { setValidationError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim());
      Keyboard.dismiss();
      router.replace("/(tabs)/dashboard");
    } catch (e) {
      setLoading(false);
      if (e?.message) setValidationError(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <AuthBubbleOverlay />
      <SafeAreaView style={styles.overlay}>
          <KeyboardAvoidingView style={styles.flex} behavior="padding">
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              <Animated.View style={{ opacity: iconAnim, transform: [{ scale: iconAnim }], alignSelf: "center", marginTop: ms(8) }}>
                <Image source={require("../../assets/taskmetrics-icon.png")} style={styles.icon} resizeMode="contain" />
              </Animated.View>
              <Animated.View style={{ opacity: cardOpacity, transform: [{ translateY: cardTranslate }] }}>
                <View>
                  <Animated.View style={[styles.glowBubble, { opacity: glowOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.15] }) }]} />
                  <View style={styles.card}>
                  <View style={styles.header}>
                    <View style={styles.backRow}>
                      <PressableBounce style={styles.backBtn} onPress={() => { Keyboard.dismiss(); router.back(); }}>
                        <Ionicons name="arrow-back" size={ms(20)} color={colors.text} />
                      </PressableBounce>
                      <Text style={styles.title}>Create Account</Text>
                    </View>
                    <Text style={styles.subtitle}>Sign up to get started</Text>
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
                        placeholder="Full Name"
                        placeholderTextColor={colors.textLight}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        autoComplete="name"
                      />
                    </BouncyInput>

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
                        autoComplete="new-password"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={fs(20)} color={colors.textLight} />
                      </TouchableOpacity>
                    </BouncyInput>

                    <BouncyInput style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor={colors.textLight}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                        autoComplete="new-password"
                      />
                    </BouncyInput>

                    <PressableBounce style={[styles.registerBtn, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading}>
                      <Text style={styles.registerBtnText}>{loading ? "Creating account..." : "Create Account"}</Text>
                    </PressableBounce>
                  </View>
                </View>
                </View>

                <PressableBounce style={styles.loginLink} onPress={() => { Keyboard.dismiss(); router.back(); }}>
                  <Text style={styles.loginText}>
                    Already have an account?{" "}
                    <Text style={styles.loginTextBold}>Sign In</Text>
                  </Text>
                </PressableBounce>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
  );
}
