
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    (async () => {
      let token: string | null = null;

      try {
        if (Platform.OS === "web") {
          token = localStorage.getItem("token");
        } else {
          token = await AsyncStorage.getItem("token");
        }
      } catch (err) {
        console.log("Error leyendo token:", err);
      }

      router.replace(token ? "/home" : "/auth/login");
    })();
  }, [mounted]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#0E3A46" />
    </View>
  );
}
