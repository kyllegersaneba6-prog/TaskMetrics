import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet, ScrollView, Alert, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONT, withAlpha, moderateScale, fontScale } from "../../src/utils/constants";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";

const THEME_OPTIONS = [
  { key: "light", label: "Light", icon: "sunny-outline" },
  { key: "dark", label: "Dark", icon: "moon-outline" },
];

function MenuItem({ icon, label, value, onPress, color, destructive, hideChevron }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.menuIcon, { backgroundColor: withAlpha(color || colors.primary, 0.08) }]}>
        <Ionicons name={icon} size={moderateScale(18)} color={color || colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: colors.text }, destructive && { color: colors.danger }]}>{label}</Text>
      <View style={styles.menuRight}>
        {value ? <Text style={[styles.menuValue, { color: colors.textLight }]}>{value}</Text> : null}
        {!hideChevron && <Ionicons name="chevron-forward" size={moderateScale(16)} color={colors.textLight} />}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [loggingOut, setLoggingOut] = useState(false);

  const ms = moderateScale;
  const fs = fontScale;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
            router.replace("/(auth)/login");
          } catch (_) {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const topInset = Math.max(insets.top, Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0);

  function AnimatedSection({ children, delay }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;
    useEffect(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
      ]).start();
    }, []);
    return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
    <View style={[styles.header, { paddingTop: topInset + ms(16), backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
    </View>
    <ScrollView contentContainerStyle={styles.content}>
      <AnimatedSection delay={0}>
        <View style={styles.profile}>
          <View style={[styles.avatar, { backgroundColor: withAlpha(colors.primary, 0.1) }]}>
            <Ionicons name="person" size={ms(32)} color={colors.primary} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user?.displayName || "User"}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email || ""}</Text>
        </View>
      </AnimatedSection>

      <AnimatedSection delay={100}>
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textLight }]}>Appearance</Text>
          <View style={[styles.themeGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {THEME_OPTIONS.map((opt) => {
              const active = mode === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.themeOption, active && { backgroundColor: withAlpha(colors.primary, 0.08) }]}
                  onPress={() => setMode(opt.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={opt.icon} size={ms(20)} color={active ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.themeOptionLabel, { color: active ? colors.primary : colors.text }]}>
                    {opt.label}
                  </Text>
                  {active && <Ionicons name="checkmark-circle" size={ms(20)} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </AnimatedSection>

      <AnimatedSection delay={200}>
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textLight }]}>Account</Text>
          <MenuItem icon="person-outline" label="Edit Profile" />
        </View>
      </AnimatedSection>

      <AnimatedSection delay={300}>
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textLight }]}>Support</Text>
          <MenuItem icon="help-circle-outline" label="Help Center" />
          <MenuItem icon="information-circle-outline" label="About" value="v1.0.0" />
        </View>
      </AnimatedSection>

      <AnimatedSection delay={400}>
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: withAlpha(colors.danger, 0.2), backgroundColor: withAlpha(colors.danger, 0.06) }, loggingOut && { opacity: 0.6 }]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          <Ionicons name="log-out-outline" size={ms(20)} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>{loggingOut ? "Signing out..." : "Sign Out"}</Text>
        </TouchableOpacity>
      </AnimatedSection>

      <AnimatedSection delay={500}>
        <Text style={[styles.footer, { color: colors.textLight }]}>TaskMetrics v1.0.0</Text>
      </AnimatedSection>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: moderateScale(12),
    paddingHorizontal: moderateScale(24),
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontScale(30),
    fontFamily: FONT.extraBold,
    letterSpacing: -0.5,
  },
  content: {
    paddingBottom: moderateScale(40),
  },
  profile: {
    alignItems: "center",
    paddingVertical: moderateScale(28),
    paddingHorizontal: moderateScale(20),
  },
  avatar: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(36),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScale(12),
  },
  name: {
    fontSize: fontScale(20),
    fontFamily: FONT.bold,
  },
  email: {
    fontSize: fontScale(14),
    fontFamily: FONT.regular,
    marginTop: moderateScale(2),
  },
  section: {
    marginBottom: moderateScale(24),
    paddingHorizontal: moderateScale(24),
  },
  sectionLabel: {
    fontSize: fontScale(12),
    fontFamily: FONT.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: moderateScale(8),
    marginLeft: moderateScale(4),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(13),
    borderRadius: moderateScale(12),
    marginBottom: moderateScale(4),
    borderWidth: 1,
  },
  menuIcon: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(12),
  },
  menuLabel: {
    flex: 1,
    fontSize: fontScale(15),
    fontFamily: FONT.medium,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
  },
  menuValue: {
    fontSize: fontScale(13),
    fontFamily: FONT.regular,
  },
  themeGroup: {
    borderRadius: moderateScale(12),
    borderWidth: 1,
    overflow: "hidden",
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(13),
    gap: moderateScale(10),
  },
  themeOptionLabel: {
    flex: 1,
    fontSize: fontScale(15),
    fontFamily: FONT.medium,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(8),
    marginHorizontal: moderateScale(24),
    paddingVertical: moderateScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    marginBottom: moderateScale(24),
  },
  logoutText: {
    fontSize: fontScale(15),
    fontFamily: FONT.semiBold,
  },
  footer: {
    textAlign: "center",
    fontSize: fontScale(12),
    fontFamily: FONT.regular,
  },
});
