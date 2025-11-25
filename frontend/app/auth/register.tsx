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
import { api } from "../../lib/api";

export default function Register() {
  const [name, setName] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !email.trim() || !pass.trim()) {
      return alert("Nombre, correo y contraseña son obligatorios");
    }
    if (pass !== pass2) {
      return alert("Las contraseñas no coinciden");
    }

    try {
      setLoading(true);

      await api("/api/auth/register", {
        method: "POST",
        body: {
          name: name.trim(),
          last: last.trim(),
          email: email.trim(),
          password: pass.trim(),
          // 👇 NO mandamos rol, el backend pone paciente/usuario
        },
        withAuth: false,
      });

      alert("Registro exitoso, ahora inicia sesión");
      router.replace("/auth/login");
    } catch (e: any) {
      alert(e?.message || "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView
        style={s.safeArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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

            <View style={s.card}>
              <Text style={s.label}>Nombre:</Text>
              <TextInput
                placeholder="Tu nombre"
                value={name}
                onChangeText={setName}
                style={s.input}
                placeholderTextColor="#9AA3AF"
              />

              <Text style={[s.label, { marginTop: 12 }]}>Apellido:</Text>
              <TextInput
                placeholder="Tu apellido"
                value={last}
                onChangeText={setLast}
                style={s.input}
                placeholderTextColor="#9AA3AF"
              />

              <Text style={[s.label, { marginTop: 12 }]}>Correo:</Text>
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

              <Text style={[s.label, { marginTop: 12 }]}>
                Confirmar contraseña:
              </Text>
              <TextInput
                placeholder="••••••••"
                value={pass2}
                onChangeText={setPass2}
                secureTextEntry
                style={s.input}
                placeholderTextColor="#9AA3AF"
              />

              <TouchableOpacity
                style={s.primaryBtn}
                onPress={onSubmit}
                disabled={loading}
              >
                <Text style={s.primaryBtnText}>
                  {loading ? "Creando..." : "Regístrate"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/auth/login")}
              style={{ marginTop: 8 }}
            >
              <Text style={s.registerText}>
                ¿Ya tienes cuenta?{" "}
                <Text style={s.registerLink}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={s.bottomLeft} />
          <View style={s.bottomRight} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingBottom: 24,
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
    marginTop: 32,
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
  primaryBtn: {
    backgroundColor: "#0E3A46",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 18,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  registerText: { color: "#121314fc", marginTop: 8 },
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
