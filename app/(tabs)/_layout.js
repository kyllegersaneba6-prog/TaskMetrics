import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
          height: 54 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: -0.2,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="apps-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cog-outline" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
