import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { quotes } from "../../utils/quotes.js";
import { getAllMoods, moodLayout, quoteNumber } from "../../utils/storage.js";

export default function Home() {
  const router = useRouter();
  const [todayMood, setTodayMood] = useState(null);

  useEffect(() => {
    const loadMood = async () => {
      const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
      const moods = await getAllMoods();

      console.log("Loaded moods:", moods);

      if (moods && moods[today]) {
        console.log("Found mood for today:", moods[today]);
        setTodayMood(moods[today]);
      } else {
        console.log("No entry for:", today);
      }
    };

    loadMood();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      {todayMood ? (
        <View style={styles.moodBox}>
          <Text style={styles.sectionTitle}>Today's Mood</Text>

          <View
            style={[
              styles.moodCircle,
              { backgroundColor: todayMood.moodColor },
            ]}
          />

          <Text style={styles.moodLabel}>
            Mood Level: {moodLayout[todayMood.mood - 1]}
          </Text>

          {todayMood.note ? (
            <Text style={styles.noteText}>“{todayMood.note}”</Text>
          ) : null}
        </View>
      ) : (
        <Text style={styles.noMood}>You haven’t logged today’s mood yet!</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("../home/map")}
      >
        <Text style={styles.buttonText}>View Heatmap</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("../home/journal")}
      >
        <Text style={styles.buttonText}>Open Journal</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("../home/stats")}
      >
        <Text style={styles.buttonText}>View Stats</Text>
      </TouchableOpacity>

      <View style={styles.bottomArea}>
        <Text style={styles.tagline}>{quotes[quoteNumber].quote}</Text>
        <Text style={styles.footerText}>
          - {quotes[quoteNumber].author} ( {quotes[quoteNumber].profession} )
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121110",
    padding: 20,
    paddingTop: 70,
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    fontFamily: "serif",
    color: "#EAE3D7",
    letterSpacing: -0.6,
    textShadow: "0 0 10px #eae3d7be, 0 0 20px #eae3d7be, 0 0 30px #eae3d7be",
  },
  moodBox: {
    marginTop: 40,
    alignItems: "center",
    padding: 22,
    borderRadius: 18,
    width: "90%",
    backgroundColor: "#1a1918",
    borderWidth: 1,
    borderColor: "#3a3733",
    boxShadow: "0 0 20px 0 #2a2928",
  },
  sectionTitle: {
    fontSize: 22,
    color: "#EAE3D7",
    fontFamily: "serif",
    fontWeight: "700",
  },
  moodCircle: {
    width: 75,
    height: 75,
    borderRadius: 50,
    marginTop: 15,
    borderWidth: 2,
    borderColor: "#EAE3D7",
  },
  moodLabel: {
    marginTop: 10,
    fontSize: 18,
    color: "#EAE3D7",
    fontFamily: "serif",
  },
  noteText: {
    marginTop: 10,
    fontSize: 16,
    color: "#CFC7BA",
    fontStyle: "italic",
    textAlign: "center",
  },
  noMood: {
    marginTop: 30,
    fontSize: 18,
    color: "#EAE3D7",
  },
  button: {
    width: "100%",
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#3b3a38",
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#3d3d3cff",
    boxShadow: "0 0 20px 0 #3b3a38b4",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#EAE3D7",
    fontFamily: "serif",
  },
  bottomArea: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    justifyContent: "flex-end",
    marginBottom: 40,
  },
  tagline: {
    color: "#C7BFB2",
    fontFamily: "serif",
    marginTop: 6,
    textAlign: "center",
    fontSize: 14,
    textShadow: "0 0 10px #c7bfb29e, 0 0 20px #c7bfb29e, 0 0 30px #c7bfb29e",
  },
  footerText: {
    marginTop: 6,
    color: "#8a8178",
    fontSize: 12,
    textAlign: "center",
  },
});
