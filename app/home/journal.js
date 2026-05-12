import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker, { useDefaultStyles } from "react-native-ui-datepicker";
import { deleteMood, getAllMoods, moodLayout } from "../../utils/storage";

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [show, setShow] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const defaultStyles = useDefaultStyles();

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

  const showPicker = () => {
    setShow(true);
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

      <TouchableOpacity style={styles.datesBtn} onPress={showPicker}>
        <Text style={styles.deleteText}>Date Range</Text>
      </TouchableOpacity>

      {show && (
        <View style={styles.datePicker}>
          <DateTimePicker
            styles={{
              ...defaultStyles,

              container: { backgroundColor: "#1a1918" },
              header_text: {
                color: "#EAE3D7",
                fontFamily: "serif",
                fontWeight: "bold",
              },

              day_name_text: {
                color: "#C6BFB4",
                fontFamily: "serif",
                fontWeight: "600",
              },

              day_text: { color: "#EAE3D7", fontFamily: "serif" },

              today: {
                borderColor: "#80231f",
                borderWidth: 1.5,
                backgroundColor: "transparent",
              },
              today_label: { color: "#EAE3D7", fontWeight: "bold" },

              selected: {
                backgroundColor: "#80231f",
                borderRadius: 8,
              },
              selected_label: {
                color: "#F5E9E5",
                fontWeight: "bold",
              },

              range_fill: {
                backgroundColor: "#383838",
              },
            }}
            mode="range"
            startDate={startDate}
            endDate={endDate}
            onChange={(params) => {
              setStartDate(params.startDate);
              setEndDate(params.endDate);

              if (params.startDate && params.endDate) {
                setShow(false);
              }
            }}
          />
        </View>
      )}

      {startDate && endDate && (
        <TouchableOpacity
          style={[styles.deleteBtn, { width: "100%", marginBottom: 10 }]}
          onPress={() => {
            setStartDate(null);
            setEndDate(null);
          }}
        >
          <Text style={styles.deleteText}>Clear filter</Text>
        </TouchableOpacity>
      )}

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

  datesBtn: {
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 6,
    backgroundColor: "#2b2b2b",
    borderRadius: 8,
    alignItems: "center",
  },

  deleteText: {
    color: "#F5E9E5",
    fontFamily: "serif",
    fontWeight: "700",
    fontSize: 14,
  },

  scroll: {
    flex: 1,
  },

  datePicker: {
    backgroundColor: "#1a1918",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    width: "100%",
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
    fontFamily: "serif",
    fontWeight: "700",
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
    fontFamily: "serif",
    fontSize: 14,
  },

  entryText: {
    color: "#EAE3D7",
    fontSize: 15,
    fontFamily: "serif",
    lineHeight: 20,
    marginTop: 4,
  },
});
