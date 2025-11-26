import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../lib/api";
import { useRouter } from "expo-router";

interface Reserva {
  id: number;
  estado: string;
  fecha_servicio: string;
  hora_inicio: string;
  hora_fin: string;
  servicio_nombre: string;
  servicio_desc: string;
  paciente_name: string;
  paciente_last: string;
}

export default function HomeMedico() {
  const router = useRouter();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [medicoId, setMedicoId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const getUser = async () => {
    try {
      let rawUser;
      if (Platform.OS === "web") rawUser = localStorage.getItem("user");
      else rawUser = await AsyncStorage.getItem("user");

      if (rawUser) {
        const user = JSON.parse(rawUser);
        setMedicoId(user.id);
      }
    } catch (e) {
      console.log("Error al obtener usuario:", e);
    }
  };

  const fetchReservas = async () => {
    if (!medicoId) return;
    setLoading(true);
    try {
      const data = await api(`/api/reservas/medico/${medicoId}`);
      setReservas(data);
    } catch (e) {
      console.log("Error cargando reservas:", e);
      Alert.alert("Error", "No se pudieron cargar las reservas");
    } finally {
      setLoading(false);
    }
  };

  const updateEstado = async (id: number, nuevoEstado: string) => {
    setUpdatingId(id);
    try {
      await api(`/api/reservas/estado/${id}`, {
        method: "PUT",
        body: { estado: nuevoEstado },
      });

      setReservas((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: nuevoEstado } : r))
      );
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "No se pudo actualizar el estado");
    } finally {
      setUpdatingId(null);
    }
  };


  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    fetchReservas();
  }, [medicoId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={s.container}>
      {/* HEADER */}
      <View style={s.header}>
        <Text style={s.h1}>Mis Reservas</Text>
        <Text style={s.h2}>Agenda de turnos asignados</Text>
      </View>

      {/* LISTADO DE RESERVAS */}
      <ScrollView contentContainerStyle={{ paddingVertical: 16, paddingBottom: 120 }}>
        <View style={{ alignItems: "center", marginTop: 20 }}>
          {reservas.length === 0 ? (
            <Text style={s.empty}>No hay reservas por ahora.</Text>
          ) : (
            reservas.map((r) => (
              <View key={r.id} style={s.card}>
                <Text style={s.servicio}>{r.servicio_nombre}</Text>
                <Text style={s.servicioDesc}>{r.servicio_desc}</Text>

                <Text style={s.paciente}>
                  Paciente: {r.paciente_name} {r.paciente_last}
                </Text>

                <Text style={s.horario}>
                  {r.fecha_servicio} • {r.hora_inicio} - {r.hora_fin}
                </Text>

                <Text style={s.estado}>Estado: {r.estado}</Text>

                {/* BOTONES DE ESTADO */}
                {r.estado === "pendiente" && (
                  <View style={s.row}>
                    <TouchableOpacity
                      style={[s.btn, { backgroundColor: "#0E3A46" }]}
                      onPress={() => updateEstado(r.id, "confirmada")}
                      disabled={updatingId === r.id}
                    >
                      <Text style={s.btnText}>Confirmar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.btn, { backgroundColor: "#B91C1C" }]}
                      onPress={() => updateEstado(r.id, "cancelada")}
                      disabled={updatingId === r.id}
                    >
                      <Text style={s.btnText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {r.estado === "confirmada" && (
                  <TouchableOpacity
                    style={[s.btn, { backgroundColor: "#B91C1C", marginTop: 8 }]}
                    onPress={() => updateEstado(r.id, "cancelada")}
                    disabled={updatingId === r.id}
                  >
                    <Text style={s.btnText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={s.bottomBar}>
        <TouchableOpacity onPress={() => router.replace("/medico/HomeScreen")} style={s.bottomBtn}>
          <Text style={s.bottomIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/medico/Horario_servicioScreen")} style={s.bottomBtn}>
          <Text style={s.bottomIcon}>🕒</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/medico/InformesScreen")} style={s.bottomBtn}>
          <Text style={s.bottomIcon}>📅</Text>
        </TouchableOpacity>
      </View>

      <View style={s.bottomLeft} />
      <View style={s.bottomRight} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#0E3A46",
    width: "140%",
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  h1: { color: "#fff", fontSize: 28, fontWeight: "800" },
  h2: { color: "#E6F1F4", fontSize: 15, fontWeight: "600", marginTop: 4 },

  empty: { color: "#6B7280", marginTop: 20, fontSize: 16 },

  card: {
    width: 340,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    elevation: 3,
  },

  servicio: { fontSize: 17, fontWeight: "700", color: "#0E3A46" },
  servicioDesc: { fontSize: 13, color: "#4B5563", marginTop: 2 },
  paciente: { fontSize: 14, marginTop: 4 },
  horario: { fontSize: 13, marginTop: 4, color: "#4B5563" },
  estado: { fontWeight: "700", marginTop: 6, color: "#0E3A46" },

  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  btn: { flex: 1, paddingVertical: 8, borderRadius: 8, marginHorizontal: 4, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#0E3A46",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomBtn: { flex: 1, alignItems: "center" },
  bottomIcon: { fontSize: 24, color: "#fff" },

  bottomLeft: { position: "absolute", bottom: 0, left: -10, width: 90, height: 80, backgroundColor: "#0E3A46", borderTopRightRadius: 80 },
  bottomRight: { position: "absolute", bottom: 0, right: -10, width: 90, height: 80, backgroundColor: "#0E3A46", borderTopLeftRadius: 80 },
});
