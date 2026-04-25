import RNDateTimePicker from "@react-native-community/datetimepicker";
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
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

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

  const showStartPicker = () => {
    setShowStart(true);
  };

  const showEndPicker = () => {
    setShowEnd(true);
  };

  const onChangeStart = (event, selectedDate) => {
    setShowStart(false);

    if (selectedDate) {
      setStartDate(selectedDate);
      console.log("start = " + startDate);
    }
  };

  const onChangeEnd = (event, selectedDate) => {
    setShowEnd(false);

    if (selectedDate) {
      setEndDate(selectedDate);
      console.log("end = " + endDate);
    }
  };

  const displayedEntries = entries.filter((entry) => {
    if (!startDate || !endDate) return true;
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return entryDate >= start && entryDate <= end;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Journal</Text>

      <View style={styles.datesGrid}>
        <TouchableOpacity style={styles.datesBtn} onPress={showStartPicker}>
          <Text style={styles.deleteText}>Start Date</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.datesBtn} onPress={showEndPicker}>
          <Text style={styles.deleteText}>End Date</Text>
        </TouchableOpacity>

        {showStart && (
          <RNDateTimePicker
            value={startDate || new Date()}
            onChange={onChangeStart}
          />
        )}
        {showEnd && (
          <RNDateTimePicker
            value={endDate || new Date()}
            onChange={onChangeEnd}
          />
        )}

        {(startDate || endDate) && (
          <TouchableOpacity
            style={[styles.deleteBtn, { width: "100%" }]}
            onPress={() => {
              setStartDate(null);
              setEndDate(null);
            }}
          >
            <Text style={styles.deleteText}>Clear filter</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scroll}>
        {displayedEntries.length === 0 ? (
          <Text style={styles.empty}>No entries yet</Text>
        ) : (
          displayedEntries.map((entry) => (
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

  datesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
    width: "100%",
  },

  datesBtn: {
    marginTop: 10,
    width: "49%",
    paddingVertical: 6,
    backgroundColor: "#383838",
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
