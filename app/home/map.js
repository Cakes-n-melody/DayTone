import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Heatmap from "../../components/Heatmap.js";
import { getAllMoods } from "../../utils/storage.js";

export default function map() {
  const [moods, setMoods] = useState({});
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    (async () => {
      const stored = await getAllMoods();
      console.log("Loaded moods from storage:", stored);
      setMoods(stored || {});
    })();
  }, []);

  function openForDate(date) {
    const key = date.toISOString().slice(0, 10);
    router.push(`mood/${key}`);
  }

  function previousMonth() {
    const day = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      currentDate.getDate(),
    );

    setCurrentDate(day);
  }

  function nextMonth() {
    const day = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate(),
    );

    setCurrentDate(day);
  }

  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        <Text style={[styles.title, { textAlign: "center" }]}>
          Mood Overview
        </Text>
      </View>

      <View style={styles.navrow}>
        <TouchableOpacity
          style={styles.navleft}
          onPress={previousMonth}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Text style={[styles.subtitle]}>←</Text>
        </TouchableOpacity>

        <Text
          style={[styles.subtitle, { textAlign: "center" }, { bottom: 15 }]}
        >
          {currentDate.toLocaleString("default", { month: "long" })}
        </Text>

        <TouchableOpacity
          style={styles.navright}
          onPress={nextMonth}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Text style={[styles.subtitle]}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <Heatmap
          moods={moods}
          onDayPress={openForDate}
          monthFor={currentDate}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#121110",
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    alignItems: "center",
    top: "18%",
    marginBottom: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    fontFamily: "serif",
    color: "#EAE3D7",
    letterSpacing: -0.6,
    textShadow: "0 0 10px #eae3d7be, 0 0 20px #eae3d7be, 0 0 30px #eae3d7be",
  },

  subtitle: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "serif",
    color: "#eae3d7cf",
    letterSpacing: -0.6,
    textShadow: "0 0 7px #eae3d7be, 0 0 14px #eae3d7be, 0 0 21px #eae3d7be",
  },

  mapContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  navleft: {
    alignItems: "center",
    right: 100,
    top: 12,
  },

  navright: {
    alignItems: "center",
    left: 100,
    bottom: 53,
  },

  navrow: {
    alignItems: "center",
    marginBottom: 10,
    top: "20%",
    zIndex: 1,
  },
});
