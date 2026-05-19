import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useColors } from "../storage/ThemeContext";

function Drum({ value, min, max, format, onChange, colors }) {
  const prev = value <= min ? max : value - 1;
  const next = value >= max ? min : value + 1;
  return (
    <View style={styles.drum}>
      <TouchableOpacity onPress={() => onChange(prev)} hitSlop={16} style={styles.arrow}>
        <Text style={[styles.arrowText, { color: colors.teal }]}>▲</Text>
      </TouchableOpacity>
      <View style={[styles.drumValue, { backgroundColor: colors.bg }]}>
        <Text style={[styles.drumText, { color: colors.text }]}>{format(value)}</Text>
      </View>
      <TouchableOpacity onPress={() => onChange(next)} hitSlop={16} style={styles.arrow}>
        <Text style={[styles.arrowText, { color: colors.teal }]}>▼</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TimePicker({ visible, hour, minute, onConfirm, onCancel }) {
  const colors = useColors();

  const initHour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const initAmpm = hour < 12 ? "AM" : "PM";

  const [h12, setH12] = useState(initHour12);
  const [min, setMin] = useState(minute);
  const [ampm, setAmpm] = useState(initAmpm);

  const onShow = () => {
    setH12(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour);
    setMin(minute);
    setAmpm(hour < 12 ? "AM" : "PM");
  };

  const handleConfirm = () => {
    let h24 = h12 % 12;
    if (ampm === "PM") h24 += 12;
    onConfirm(h24, min);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onShow={onShow}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
          <Text style={[styles.title, { color: colors.text }]}>Set reminder time</Text>

          <View style={styles.pickerRow}>
            <Drum value={h12} min={1} max={12} format={(v) => String(v)} onChange={setH12} colors={colors} />
            <Text style={[styles.colon, { color: colors.text }]}>:</Text>
            <Drum value={min} min={0} max={59} format={(v) => String(v).padStart(2, "0")} onChange={setMin} colors={colors} />
            <TouchableOpacity
              style={[styles.ampmBox, { backgroundColor: colors.bg }]}
              onPress={() => setAmpm((a) => (a === "AM" ? "PM" : "AM"))}
              activeOpacity={0.7}
            >
              <Text style={[styles.ampmText, { color: colors.muted }, ampm === "AM" && { color: colors.teal, fontWeight: "800" }]}>AM</Text>
              <Text style={[styles.ampmText, { color: colors.muted }, ampm === "PM" && { color: colors.teal, fontWeight: "800" }]}>PM</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={onCancel} style={[styles.btnCancel, { backgroundColor: colors.bg }]}>
              <Text style={[styles.btnCancelText, { color: colors.muted }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={[styles.btnConfirm, { backgroundColor: colors.teal }]}>
              <Text style={styles.btnConfirmText}>Set</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  sheet: {
    borderRadius: 20, paddingVertical: 28, paddingHorizontal: 32, width: 300, alignItems: "center", borderWidth: 1,
    ...Platform.select({ android: { elevation: 8 }, ios: { shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 16 } }),
  },
  title: { fontSize: 17, fontWeight: "700", marginBottom: 28, letterSpacing: 0.3 },
  pickerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 32 },
  drum: { alignItems: "center", width: 60 },
  arrow: { paddingVertical: 4 },
  arrowText: { fontSize: 16 },
  drumValue: { width: 60, height: 52, borderRadius: 12, justifyContent: "center", alignItems: "center", marginVertical: 6 },
  drumText: { fontSize: 28, fontWeight: "700", fontVariant: ["tabular-nums"] },
  colon: { fontSize: 28, fontWeight: "700", marginTop: -4 },
  ampmBox: { marginLeft: 8, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, gap: 10, alignItems: "center" },
  ampmText: { fontSize: 14, fontWeight: "600" },
  buttons: { flexDirection: "row", gap: 12, width: "100%" },
  btnCancel: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnCancelText: { fontWeight: "600", fontSize: 15 },
  btnConfirm: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnConfirmText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
