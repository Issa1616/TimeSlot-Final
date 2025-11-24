import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useReservas } from "../store/reservas";

const AREAS = [
  "Gastroenterología",
  "Clínica Médica",
  "Cardiología",
  "Dermatología",
];

const PROFES = [
  "JENSEN, María Virginia",
  "GARCÍA, Pablo",
  "SILVA, Andrea",
  "RODRÍGUEZ, Juan",
];

const HORAS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
];

type MonthDay = {
  key: string;
  day: number;
  iso?: string;
};

export default function NuevaReserva() {
  const add = useReservas((s) => s.add);
  const reservas = useReservas((s) => s.reservas);

  const [area, setArea] = useState<string>("");
  const [profesional, setProfesional] = useState<string>("");
  const [fechaISO, setFechaISO] = useState<string>(toISO(new Date()));
  const [hora, setHora] = useState<string>("08:00");

  const [openArea, setOpenArea] = useState(false);
  const [openPro, setOpenPro] = useState(false);
  const [openHora, setOpenHora] = useState(false);

  const diasMes = useMemo(
    () => buildMonthDays(new Date(fechaISO)),
    [fechaISO]
  );

  const reservasProfesional = useMemo(
    () => reservas.filter((r) => r.profesional === profesional),
    [reservas, profesional]
  );

  const reservasByDay = useMemo(() => {
    const map = new Map<string, Set<string>>();
    reservasProfesional.forEach((r) => {
      if (!map.has(r.fechaISO)) map.set(r.fechaISO, new Set());
      map.get(r.fechaISO)!.add(r.hora);
    });
    return map;
  }, [reservasProfesional]);

  const horasDisponibles = useMemo(() => {
    if (!profesional) return HORAS;
    const booked = reservasByDay.get(fechaISO);
    if (!booked) return HORAS;
    return HORAS.filter((h) => !booked.has(h));
  }, [profesional, fechaISO, reservasByDay]);

  const crear = async () => {
    if (!area || !profesional || !fechaISO || !hora) {
      return alert("Completa todos los campos");
    }

    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        alert("No hay sesión activa. Inicia sesión nuevamente.");
        return;
      }

      const res = await fetch("http://192.168.12.197:4000/api/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          area,
          profesional,
          fechaISO,
          hora,
          modalidad: "Presencial",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.log("Error backend:", err);
        alert("No se pudo crear la reserva");
        return;
      }

      const nueva = await res.json();
      add(nueva);
      router.replace("/home");
    } catch (e) {
      console.log(e);
      alert("Error de conexión con el servidor");
    }
  };

  const abrirHora = () => {
    if (!profesional) {
      alert("Primero selecciona un profesional");
      return;
    }
    if (horasDisponibles.length === 0) {
      alert(
        "Este día no tiene horarios disponibles para este profesional. Elige otra fecha."
      );
      return;
    }
    setOpenHora(true);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scrollContent}>
        <View style={s.container}>
          <TouchableOpacity
            onPress={() => router.replace("/home")}
            style={s.backBtn}
          >
            <Text style={s.backText}>‹</Text>
          </TouchableOpacity>

          <View style={s.header}>
            <View style={s.cornerTopLeft} />
            <View style={s.cornerTopRight} />
            <Text style={s.hSmall}>Crea Tu</Text>
            <Text style={s.hBig}>RESERVA</Text>
          </View>

          <View style={s.form}>
            <Text style={s.label}>Area</Text>
            <Pressable style={s.select} onPress={() => setOpenArea(true)}>
              <Text style={s.selectText}>
                {area || "Selecciona un área"}
              </Text>
              <Text style={s.caret}>▾</Text>
            </Pressable>

            <Text style={[s.label, { marginTop: 18 }]}>Profesional</Text>
            <Pressable style={s.select} onPress={() => setOpenPro(true)}>
              <Text style={s.selectText}>
                {profesional || "Selecciona un profesional"}
              </Text>
              <Text style={s.caret}>▾</Text>
            </Pressable>

            <Text style={[s.label, { marginTop: 18 }]}>Fecha</Text>
            <View style={s.calendar}>
              <View style={s.calHead}>
                <TouchableOpacity
                  onPress={() =>
                    setFechaISO(toISO(addMonths(new Date(fechaISO), -1)))
                  }
                >
                  <Text style={s.arrow}>‹</Text>
                </TouchableOpacity>
                <Text style={s.monthLabel}>
                  {formatMonthYear(new Date(fechaISO))}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setFechaISO(toISO(addMonths(new Date(fechaISO), 1)))
                  }
                >
                  <Text style={s.arrow}>›</Text>
                </TouchableOpacity>
              </View>

              <View style={s.weekRow}>
                {["D", "L", "M", "MI", "J", "V", "S"].map((d) => (
                  <Text key={d} style={s.weekDay}>
                    {d}
                  </Text>
                ))}
              </View>

              <View style={s.daysGrid}>
                {diasMes.map((d) => {
                  const booked = d.iso ? reservasByDay.get(d.iso) : undefined;
                  const hasReserva = !!booked && booked.size > 0;
                  const fullBooked =
                    !!booked && booked.size >= HORAS.length;

                  const disabled =
                    !d.day || !profesional || fullBooked;

                  return (
                    <TouchableOpacity
                      key={d.key}
                      disabled={disabled}
                      style={[
                        s.dayCell,
                        hasReserva ? s.dayHasReserva : null,
                        fullBooked ? s.dayFull : null,
                        d.iso === fechaISO && d.day && !fullBooked
                          ? s.daySelected
                          : null,
                        !d.day ? { opacity: 0 } : null,
                      ]}
                      onPress={() => d.iso && setFechaISO(d.iso)}
                    >
                      <Text
                        style={[
                          s.dayText,
                          d.iso === fechaISO &&
                          d.day &&
                          !fullBooked
                            ? { color: "#fff", fontWeight: "800" }
                            : null,
                          disabled && d.day ? { color: "#9CA3AF" } : null,
                        ]}
                      >
                        {d.day || ""}
                      </Text>
                      {hasReserva && !fullBooked && (
                        <View style={s.dot} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Text style={[s.label, { marginTop: 18 }]}>Hora</Text>
            <Pressable style={s.select} onPress={abrirHora}>
              <Text style={s.selectText}>{hora}</Text>
              <Text style={s.caret}>▾</Text>
            </Pressable>

            <TouchableOpacity style={s.primaryBtn} onPress={crear}>
              <Text style={s.primaryBtnText}>Crear</Text>
            </TouchableOpacity>
          </View>

          <View style={s.cornerBottomLeft} />
          <View style={s.cornerBottomRight} />
        </View>
      </ScrollView>

      <SimplePicker
        visible={openArea}
        title="Selecciona un área"
        items={AREAS}
        onClose={() => setOpenArea(false)}
        onPick={setArea}
      />
      <SimplePicker
        visible={openPro}
        title="Selecciona un profesional"
        items={PROFES}
        onClose={() => setOpenPro(false)}
        onPick={setProfesional}
      />
      <SimplePicker
        visible={openHora}
        title="Selecciona la hora"
        items={horasDisponibles}
        onClose={() => setOpenHora(false)}
        onPick={setHora}
      />
    </SafeAreaView>
  );
}

function SimplePicker({
  visible,
  title,
  items,
  onClose,
  onPick,
}: {
  visible: boolean;
  title: string;
  items: string[];
  onClose: () => void;
  onPick: (v: string) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={modalStyles.backdrop} onPress={onClose}>
        <View style={modalStyles.sheet}>
          <Text style={modalStyles.title}>{title}</Text>
          <FlatList
            data={items}
            keyExtractor={(x) => x}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={modalStyles.item}
                onPress={() => {
                  onPick(item);
                  onClose();
                }}
              >
                <Text style={modalStyles.itemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatMonthYear(d: Date) {
  const meses = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];
  return `${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function buildMonthDays(base: Date): MonthDay[] {
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const last = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  const offset = first.getDay();
  const total = last.getDate();

  const cells: MonthDay[] = [];

  for (let i = 0; i < offset; i++) {
    cells.push({ key: `e${i}`, day: 0, iso: undefined });
  }

  for (let d = 1; d <= total; d++) {
    const iso = toISO(new Date(base.getFullYear(), base.getMonth(), d));
    cells.push({ key: `d${d}`, day: d, iso });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `z${cells.length}`, day: 0, iso: undefined });
  }

  return cells;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  scrollContent: { flexGrow: 1 },
  container: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 40,
  },

  backBtn: {
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0E3A46",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  header: {
    marginTop: 24,
    marginBottom: 24,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cornerTopLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 80,
    height: 60,
    backgroundColor: "#0E3A46",
    borderBottomRightRadius: 80,
  },
  cornerTopRight: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 80,
    height: 60,
    backgroundColor: "#0E3A46",
    borderBottomLeftRadius: 80,
  },
  hSmall: {
    fontSize: 20,
    color: "#0E3A46",
    fontFamily: Platform.select({
      ios: "Times New Roman",
      android: "serif",
      default: "serif",
    }),
  },
  hBig: {
    fontSize: 28,
    marginTop: 4,
    color: "#0E3A46",
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: Platform.select({
      ios: "Times New Roman",
      android: "serif",
      default: "serif",
    }),
  },

  form: {
    width: "80%",
    maxWidth: 320,
  },

  label: {
    color: "#0E3A46",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 6,
  },
  select: {
    height: 42,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { color: "#111827", fontSize: 14 },
  caret: { color: "#4B5563", fontSize: 16 },

  calendar: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    width: 230,
  },
  calHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  monthLabel: {
    color: "#0E3A46",
    fontWeight: "700",
    fontSize: 12,
  },
  arrow: { color: "#0E3A46", fontSize: 18, paddingHorizontal: 4 },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  weekDay: {
    width: `${100 / 7}%`,
    textAlign: "center",
    color: "#4B5563",
    fontSize: 10,
  },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    marginVertical: 1,
  },
  daySelected: { backgroundColor: "#0E3A46" },
  dayHasReserva: {
    borderWidth: 1,
    borderColor: "#0E3A46",
    backgroundColor: "#E0F2FE",
  },
  dayFull: {
    backgroundColor: "#E5E7EB",
  },
  dayText: { color: "#0E3A46", fontSize: 11 },
  dot: {
    marginTop: 1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#0E3A46",
  },

  primaryBtn: {
    backgroundColor: "#0E3A46",
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 24,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "600" },

  cornerBottomLeft: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 80,
    height: 60,
    backgroundColor: "#0E3A46",
    borderTopRightRadius: 80,
  },
  cornerBottomRight: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 80,
    height: 60,
    backgroundColor: "#0E3A46",
    borderTopLeftRadius: 80,
  },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    width: "86%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
  },
  title: {
    color: "#0E3A46",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemText: { color: "#111827" },
});
