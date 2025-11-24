import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { api } from "../lib/api";

export default function Reset() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [pass, setPass] = useState("");

  const onSubmit = async () => {
    if (!token) return Alert.alert("Token inválido");
    if (!pass.trim()) return Alert.alert("Ingresa una nueva contraseña");
    try {
      await api("/api/auth/reset", { method: "POST", body: { token, password: pass } });
      Alert.alert("Listo", "Contraseña actualizada");
      router.replace("/auth/login");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "No se pudo restablecer");
    }
  };

  return (
    <View style={{ flex:1, padding: 20, justifyContent:"center" }}>
      <Text style={{ fontSize: 20, fontWeight:"700", marginBottom: 10 }}>Restablecer contraseña</Text>
      <Text style={{ marginBottom: 6 }}>Token: {typeof token === "string" ? token.slice(0, 10) + "..." : "—"}</Text>
      <TextInput placeholder="Nueva contraseña" secureTextEntry value={pass} onChangeText={setPass}
        style={{ borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:10, marginBottom:12 }} />
      <TouchableOpacity onPress={onSubmit} style={{ backgroundColor:"#0E3A46", padding:12, borderRadius:8, alignItems:"center" }}>
        <Text style={{ color:"#fff", fontWeight:"700" }}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
}
