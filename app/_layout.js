import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Font from "expo-font";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/context/AuthContext";
import { TasksProvider } from "../src/context/TasksContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import LoadingSpinner from "../src/components/LoadingSpinner";

function RootLayoutInner() {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = Font.useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

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
