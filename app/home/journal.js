import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteMood, getAllMoods, moodLayout } from "../../utils/storage";

export default function Journal() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    async function load() {
      const all = await getAllMoods();

      const formatted = Object.entries(all || {}).map(([date, data]) => ({
        date,
        mood: data.mood,
        moodColor: data.moodColor,
        note: data.note,
      }));

      formatted.sort((a, b) => new Date(b.date) - new Date(a.date));

      setEntries(formatted);
    }

    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Journal</Text>

      <ScrollView style={styles.scroll}>
        {entries.length === 0 ? (
          <Text style={styles.empty}>No entries yet</Text>
        ) : (
          entries.map((entry) => (
            <View key={entry.date} style={styles.entryCard}>
              <Text style={styles.entryDate}>Date: {entry.date}</Text>

              <View style={styles.moodRow}>
                <View
                  style={[styles.moodDot, { backgroundColor: entry.moodColor }]}
                />
                <Text style={styles.entryMood}>
                  Mood Level: {moodLayout[entry.mood - 1]}
                </Text>
              </View>

              <Text style={styles.entryText}>
                {entry.note || "No note added."}
              </Text>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={async () => {
                  await deleteMood(entry.date);
                  setEntries((prev) =>
                    prev.filter((e) => e.date !== entry.date),
                  );
                }}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121110",
    padding: 20,
    paddingTop: 50,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "serif",
    color: "#EAE3D7",
    textAlign: "center",
    marginBottom: 20,
    textShadow: "0 0 10px #eae3d7be, 0 0 20px #eae3d7be",
  },

  deleteBtn: {
    marginTop: 10,
    paddingVertical: 6,
    backgroundColor: "#80231f",
    borderRadius: 8,
    alignItems: "center",
  },

  deleteText: {
    color: "#F5E9E5",
    fontWeight: "600",
    fontSize: 14,
  },

  scroll: {
    flex: 1,
  },

  empty: {
    color: "#EAE3D7",
    textAlign: "center",
    marginTop: 40,
    opacity: 0.7,
    fontSize: 16,
  },

  entryCard: {
    backgroundColor: "#1a1918",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
  },

  entryDate: {
    color: "#EAE3D7",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },

  moodRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  moodDot: {
    width: 18,
    height: 18,
    borderRadius: 10,
    marginRight: 10,
  },

  entryMood: {
    color: "#C6BFB4",
    fontSize: 14,
  },

  entryText: {
    color: "#EAE3D7",
    fontSize: 15,
    lineHeight: 20,
    marginTop: 4,
  },
});
