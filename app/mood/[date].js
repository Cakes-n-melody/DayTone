import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteMood, getMood, saveMood } from "../../utils/storage.js";

const MOOD_PALETTE = {
  1: "#8a241f",
  2: "#b65a3f",
  3: "#cdaa6b",
  4: "#9fb987",
  5: "#6a8c6e",
};

export default function MoodEntry() {
  const { date } = useLocalSearchParams(); // YYYY-MM-DD
  const router = useRouter();
  const [note, setNote] = useState("");
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    (async () => {
      const e = await getMood(date);
      if (e) {
        setExisting(e);
        setNote(e.note || "");
      }
    })();
  }, [date]);

  async function pickMood(moodValue) {
    await saveMood(date, {
      mood: moodValue,
      moodColor: MOOD_PALETTE[moodValue],
      note,
    });
    router.replace("/");
  }

  async function clear() {
    await deleteMood(date);
    router.replace("/");
  }

  return (
    <View style={styles.shell}>
      <View style={styles.card}>
        <Text style={styles.dateTitle}>{new Date(date).toDateString()}</Text>

        <Text style={styles.label}>Pick a mood</Text>
        <View style={styles.row}>
          {Object.entries(MOOD_PALETTE).map(([k, c]) => (
            <TouchableOpacity
              key={k}
              style={[styles.swatch, { backgroundColor: c }]}
              onPress={() => pickMood(Number(k))}
            />
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>Note (optional)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Something brief about the day..."
          multiline
          style={styles.input}
        />

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clear}>
            <Text style={styles.clear}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#1A1817", padding: 20 },
  card: {
    backgroundColor: "#242220",
    borderRadius: 14,
    padding: 18,
    // subtle shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 4 },
    }),
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#EAE3D7",
    textShadow: "0 0 10px #eae3d7be, 0 0 20px #eae3d7be, 0 0 30px #eae3d7be",
  },
  label: {
    marginTop: 12,
    fontWeight: "600",
    color: "#C7BFB2",
    textShadow: "0 0 10px #c7bfb29f, 0 0 20px #c7bfb29f, 0 0 30px #c7bfb29f",
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  swatch: {
    width: 64,
    height: 64,
    borderRadius: 12,
    boxShadow: "0 0 12px 0px #35312E",
  },
  input: {
    marginTop: 8,
    minHeight: 88,
    borderWidth: 1,
    borderColor: "#35312E",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#2C2A28",
    color: "#978F85",
    textShadow: "0 0 10px #978f85c0, 0 0 20px #978f85c0, 0 0 30px #978f85c0",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cancel: { color: "#6b6158", fontWeight: "700" },
  clear: { color: "#9c2f2f", fontWeight: "700" },
});
