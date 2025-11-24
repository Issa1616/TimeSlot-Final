import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { api } from "../../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

const saveToken = async (token: string, user: any) => {
    if (Platform.OS === "web") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("user", JSON.stringify(user));
    }
  };

  const onLogin = async () => {
    if (!email.trim() || !pass.trim()) {
      return alert("Ingresa tu correo y contraseña");
    }

    try {
      setLoading(true);

      const data = await api<{ token: string; user: any }>("/api/auth/login", {
        method: "POST",
        body: { email: email.trim(), password: pass.trim() },
      });

      await saveToken(data.token, data.user);

      router.replace("/home");
    } catch (e: any) {
      alert(e?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        <View style={s.header}>
          <Image
            source={require("../../assets/logo.png")}
            style={s.logo}
            resizeMode="contain"
          />
          <Text style={s.h1}>Bienvenido</Text>
          <Text style={s.h2}>a TimeSlot</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.kav}
        >
          <ScrollView
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.card}>
              <Text style={s.label}>Correo:</Text>
              <TextInput
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={s.input}
                placeholderTextColor="#9AA3AF"
              />

              <Text style={[s.label, { marginTop: 12 }]}>Contraseña:</Text>
              <TextInput
                placeholder="••••••••"
                value={pass}
                onChangeText={setPass}
                secureTextEntry
                style={s.input}
                placeholderTextColor="#9AA3AF"
              />

              <TouchableOpacity
                onPress={() => router.push("/auth/forgot")}
                style={{ alignSelf: "center", marginTop: 8 }}
              >
                <Text style={s.helperLink}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.primaryBtn}
                onPress={onLogin}
                disabled={loading}
              >
                <Text style={s.primaryBtnText}>
                  {loading ? "Ingresando..." : "Iniciar Sesión"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/auth/register")}
              style={{ marginTop: 8 }}
            >
              <Text style={s.registerText}>
                ¿No tienes una cuenta?{" "}
                <Text style={s.registerLink}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={s.bottomLeft} />
        <View style={s.bottomRight} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  kav: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 24,
    paddingTop: 24,
  },

  header: {
    backgroundColor: "#0E3A46",
    width: "120%",          
    paddingVertical: 32,    
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  logo: { width: 64, height: 64, marginBottom: 6 },
  h1: {
    color: "#FFFFFF",
    fontSize: 32,           
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  h2: {
    color: "#E6F1F4",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },

  card: {
    width: "88%",           
    maxWidth: 380,
    backgroundColor: "#fff",
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  label: { color: "#0E3A46", fontWeight: "700", marginBottom: 6 },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#111827",
  },
  helperLink: { color: "#6B7280", fontSize: 12 },
  primaryBtn: {
    backgroundColor: "#0E3A46",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  registerText: { color: "#121314fc" },
  registerLink: { color: "#125496ff", fontWeight: "700" },

  bottomLeft: {
    position: "absolute",
    bottom: 0,
    left: -10,
    width: 90,
    height: 80,
    backgroundColor: "#0E3A46",
    borderTopRightRadius: 80,
  },
  bottomRight: {
    position: "absolute",
    bottom: 0,
    right: -10,
    width: 90,
    height: 80,
    backgroundColor: "#0E3A46",
    borderTopLeftRadius: 80,
  },
});
