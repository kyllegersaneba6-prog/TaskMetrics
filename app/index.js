import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import LoadingSpinner from "../src/components/LoadingSpinner";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}
