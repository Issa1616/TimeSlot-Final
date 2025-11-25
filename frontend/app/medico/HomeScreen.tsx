import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from "react-native";
import { api } from "../../lib/api";

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
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const medicoId = 2; 

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const data = await api(`/api/reservas/medico/${medicoId}`);
        setReservas(data);
      } catch (e) {
        console.log("Error cargando reservas:", e);
      }
    };
    fetchReservas();
  }, []);

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.title}>Mis Reservas</Text>
      <ScrollView style={s.scroll}>
        {reservas.length === 0 ? (
          <Text style={s.empty}>No hay reservas por ahora.</Text>
        ) : (
          reservas.map((r) => (
            <View key={r.id} style={s.card}>
              <Text style={s.servicio}>{r.servicio_nombre}</Text>
              <Text style={s.paciente}>Paciente: {r.paciente_name} {r.paciente_last}</Text>
              <Text style={s.horario}>
                {r.fecha_servicio} • {r.hora_inicio} - {r.hora_fin}
              </Text>
              <Text style={s.estado}>Estado: {r.estado}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#EEF3F6" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
  scroll: { flex: 1 },
  empty: { textAlign: "center", marginTop: 20, color: "#6B7280" },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 12, marginBottom: 12 },
  servicio: { fontWeight: "700", fontSize: 16 },
  paciente: { marginTop: 4, fontSize: 14 },
  horario: { fontSize: 13, color: "#4B5563", marginTop: 2 },
  estado: { marginTop: 4, fontWeight: "600", color: "#0E3A46" },
});
