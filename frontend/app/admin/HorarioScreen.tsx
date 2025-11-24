import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../lib/api";

interface Horario {
  id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  abierto: boolean;
}

export default function HorarioScreen() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [guardando, setGuardando] = useState(false);

  const fetchHorarios = async () => {
    try {
      const data = await api<Horario[]>("/api/horarios");
      setHorarios(data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los horarios");
    }
  };

  useEffect(() => {
    fetchHorarios();
  }, []);

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await api("/api/horarios", {
        method: "PUT",
        body: horarios,
      });
      Alert.alert("Éxito", "Horarios actualizados correctamente");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleAbierto = (id: number, value: boolean) => {
    setHorarios((prev) =>
      prev.map((h) => (h.id === id ? { ...h, abierto: value } : h))
    );
  };

  const handleChangeHora = (
    id: number,
    campo: "hora_inicio" | "hora_fin",
    valor: string
  ) => {
    setHorarios((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [campo]: valor } : h))
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Image source={{ uri: "" }} style={s.logo} resizeMode="contain" />
        <Text style={s.h1}>Horario</Text>
        <Text style={s.h2}>de tu Negocio</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, width: "100%" }}
      >
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            <Text style={s.sectionTitle}>🕓 Configura tus horarios</Text>

            {horarios.map((h) => (
              <View key={h.id} style={s.dayCard}>
                <Text style={s.dayTitle}>{h.dia_semana.toUpperCase()}</Text>

                <View style={s.row}>
                  <Text style={s.label}>{h.abierto ? "Abierto" : "Cerrado"}:</Text>
                  <Switch
                    value={h.abierto}
                    onValueChange={(v) => handleToggleAbierto(h.id, v)}
                  />
                </View>

                {h.abierto && (
                  <>
                    <View style={s.row}>
                      <Text style={s.label}>Inicio:</Text>
                      <TextInput
                        style={s.input}
                        value={h.hora_inicio}
                        onChangeText={(v) => handleChangeHora(h.id, "hora_inicio", v)}
                        placeholder="HH:MM:SS"
                        placeholderTextColor="#9AA3AF"
                      />
                    </View>

                    <View style={s.row}>
                      <Text style={s.label}>Fin:</Text>
                      <TextInput
                        style={s.input}
                        value={h.hora_fin}
                        onChangeText={(v) => handleChangeHora(h.id, "hora_fin", v)}
                        placeholder="HH:MM:SS"
                        placeholderTextColor="#9AA3AF"
                      />
                    </View>
                  </>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={s.primaryBtn}
              onPress={handleGuardar}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.primaryBtnText}>Guardar Cambios</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={s.bottomLeft} />
      <View style={s.bottomRight} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center" },
  header: {
    backgroundColor: "#0E3A46",
    width: "130%",
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  logo: { width: 64, height: 64, marginBottom: 6 },
  h1: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 0.3,
    fontFamily: Platform.select({
      ios: "Times New Roman",
      android: "serif",
      default: "serif",
    }),
  },
  h2: { color: "#E6F1F4", fontSize: 16, fontWeight: "700", marginTop: 2 },
  card: {
    width: 340,
    backgroundColor: "#fff",
    marginTop: 50,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0E3A46",
    marginBottom: 12,
    textAlign: "center",
  },
  dayCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dayTitle: { fontWeight: "700", color: "#0E3A46", marginBottom: 6 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  label: { color: "#0E3A46", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 6,
    width: 100,
    textAlign: "center",
    borderRadius: 8,
    backgroundColor: "#fff",
    color: "#111827",
  },
  primaryBtn: {
    backgroundColor: "#0E3A46",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
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
