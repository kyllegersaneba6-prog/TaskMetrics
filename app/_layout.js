import { useState, useEffect, useRef } from "react";
import { View } from "react-native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/context/AuthContext";
import { TasksProvider } from "../src/context/TasksContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { requestPermissions, addNotificationResponseListener, isStopAction, dismissNotification } from "../src/services/notifications";
import { emitTaskOpen } from "../src/utils/taskOpenRef";

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { theme } = useTheme();

  useEffect(() => {
    requestPermissions();
    const unsub = addNotificationResponseListener((data) => {
      if (isStopAction(data?.actionId)) {
        dismissNotification(data?.notificationId);
        return;
      }
      if (data?.taskId) {
        router.push("/(tabs)/tasks");
        emitTaskOpen(data.taskId);
      }
    });
    return unsub;
  }, []);

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </View>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          Inter_400Regular,
          Inter_500Medium,
          Inter_600SemiBold,
          Inter_700Bold,
          Inter_800ExtraBold,
        });
      } catch (_) {}
      if (mountedRef.current) {
        setFontsLoaded(true);
        SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TasksProvider>
          <ThemeProvider>
            <RootLayoutInner />
          </ThemeProvider>
        </TasksProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
