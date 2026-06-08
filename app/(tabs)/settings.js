import { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONT, withAlpha, moderateScale, fontScale } from "../../src/utils/constants";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import AnimatedSection from "../../src/components/AnimatedSection";
import TabBubbleOverlay from "../../src/components/TabBubbleOverlay";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [loggingOut, setLoggingOut] = useState(false);

  const ms = moderateScale;
  const fs = fontScale;

  const THEME_OPTIONS = [
    { key: "light", label: "Light", icon: "sunny-outline" },
    { key: "dark", label: "Dark", icon: "moon-outline" },
  ];

  function MenuItem({ icon, label, value, onPress, color, destructive, hideChevron }) {
    return (
      <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.6}>
        <View style={[styles.menuIcon, { backgroundColor: withAlpha(color || colors.primary, 0.08) }]}>
          <Ionicons name={icon} size={ms(18)} color={color || colors.primary} />
        </View>
        <Text style={[styles.menuLabel, { color: colors.text }, destructive && { color: colors.danger }]}>{label}</Text>
        <View style={styles.menuRight}>
          {value ? <Text style={[styles.menuValue, { color: colors.textLight }]}>{value}</Text> : null}
          {!hideChevron && <Ionicons name="chevron-forward" size={ms(16)} color={colors.textLight} />}
        </View>
      </TouchableOpacity>
    );
  }

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

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingBottom: ms(12),
      paddingHorizontal: ms(24),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: fs(30),
      fontFamily: FONT.extraBold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    content: {
      paddingBottom: ms(40),
    },
    profile: {
      alignItems: "center",
      paddingVertical: ms(28),
      paddingHorizontal: ms(20),
    },
    avatar: {
      width: ms(72),
      height: ms(72),
      borderRadius: ms(36),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: ms(12),
    },
    name: {
      fontSize: fs(20),
      fontFamily: FONT.bold,
      color: colors.text,
    },
    email: {
      fontSize: fs(14),
      fontFamily: FONT.regular,
      color: colors.textSecondary,
      marginTop: ms(2),
    },
    section: {
      marginBottom: ms(24),
      paddingHorizontal: ms(24),
    },
    sectionLabel: {
      fontSize: fs(12),
      fontFamily: FONT.semiBold,
      color: colors.textLight,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: ms(8),
      marginLeft: ms(4),
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: ms(14),
      paddingVertical: ms(13),
      borderRadius: ms(12),
      marginBottom: ms(4),
      borderWidth: 1,
    },
    menuIcon: {
      width: ms(34),
      height: ms(34),
      borderRadius: ms(10),
      justifyContent: "center",
      alignItems: "center",
      marginRight: ms(12),
    },
    menuLabel: {
      flex: 1,
      fontSize: fs(15),
      fontFamily: FONT.medium,
    },
    menuRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: ms(4),
    },
    menuValue: {
      fontSize: fs(13),
      fontFamily: FONT.regular,
    },
    themeGroup: {
      borderRadius: ms(12),
      borderWidth: 1,
      overflow: "hidden",
    },
    themeOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: ms(16),
      paddingVertical: ms(13),
      gap: ms(10),
    },
    themeOptionLabel: {
      flex: 1,
      fontSize: fs(15),
      fontFamily: FONT.medium,
    },
    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(8),
      marginHorizontal: ms(24),
      paddingVertical: ms(14),
      borderRadius: ms(12),
      backgroundColor: colors.danger,
      marginBottom: ms(24),
    },
    logoutText: {
      fontSize: fs(15),
      fontFamily: FONT.semiBold,
    },
    footer: {
      textAlign: "center",
      fontSize: fs(12),
      fontFamily: FONT.regular,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <TabBubbleOverlay />
      <View style={[styles.header, { paddingTop: topInset + ms(16), borderBottomColor: colors.border }]}>
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
          style={[styles.logoutBtn, loggingOut && { opacity: 0.6 }]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          <Ionicons name="log-out-outline" size={ms(20)} color={colors.white} />
          <Text style={[styles.logoutText, { color: colors.white }]}>{loggingOut ? "Signing out..." : "Sign Out"}</Text>
        </TouchableOpacity>
      </AnimatedSection>

      <AnimatedSection delay={500}>
        <Text style={[styles.footer, { color: colors.textLight }]}>TaskMetrics v1.0.0</Text>
      </AnimatedSection>
    </ScrollView>
    </View>
  );
}
