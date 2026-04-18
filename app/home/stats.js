import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { getAllMoods, month, moodLayout } from "../../utils/storage.js";

export default function stats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const moods = await getAllMoods();
      const computed = computedStats(moods);
      setStats(computed);
    })();
  }, []);

  if (!stats) return <Text style={{ colour: "white" }}>Loading...</Text>;

  return (
    <ScrollView style={styles.shell}>
      <Text style={styles.header}>Your Mood Stats</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Total Entries:</Text>
        <Text style={styles.value}>{stats.totalEntries}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Best Day Of The Month:</Text>
        <Text style={styles.value}>{stats.bestDay}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Worst Day Of The Month:</Text>
        <Text style={styles.value}>{stats.worstDay}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Current Streak:</Text>
        <Text style={styles.value}>{stats.streak} days</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Most Common Mood:</Text>
        <Text style={styles.value}>{moodLayout[stats.commonMood - 1]}</Text>
      </View>

      <View style={[styles.card, { marginBottom: 40 }]}>
        <Text style={styles.label}>Mood Frequency:</Text>
        {Object.entries(stats.frequency).map(([mood, count]) => (
          <Text key={mood} style={styles.value}>
            Mood "{moodLayout[mood - 1]}" : {count} days
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

function computedStats(moods) {
  const dates = Object.keys(moods).sort((a, b) => b.localeCompare(a));
  const entries = Object.values(moods);

  if (entries.length === 0) {
    return {
      totalEntries: 0,
      bestDay: "None",
      WorstDay: "None",
      streak: 0,
      commonMood: "None",
      frequency: {},
    };
  }

  console.log(dates);

  const totalEntries = entries.length;

  let best = 0;
  let worst = 6;
  let bestDate = dates[0];
  let worstDate = dates[0];

  dates.forEach((d) => {
    console.log(
      "d = " +
        parseInt(d.substring(d.indexOf("-") + 1, d.lastIndexOf("-"))) +
        "\nmonth = " +
        parseInt(d.substring(d.indexOf("-") + 1, d.lastIndexOf("-"))),
    );
    console.log(moods[d].mood);
    console.log(moods[d]);
    console.log(best + bestDate);
    if (
      moods[d].mood > best &&
      month == parseInt(d.substring(d.indexOf("-") + 1, d.lastIndexOf("-")))
    ) {
      best = moods[d].mood;
      bestDate = d;
      console.log(d);
    }
    if (
      moods[d].mood < worst &&
      month == parseInt(d.substring(d.indexOf("-") + 1, d.lastIndexOf("-")))
    ) {
      worst = moods[d].mood;
      worstDate = d;
    }
  });

  const freq = {};
  entries.forEach((e) => {
    freq[e.mood] = (freq[e.mood] || 0) + 1;
  });

  const commonMood = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];

  let streak = 1;
  for (let i = dates.length - 1; i > 0; i++) {
    const cur = new Date(dates[i]);
    const prev = new Date(dates[i - 1]);

    const diff = (cur - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }

  return {
    totalEntries,
    bestDay: `${bestDate} ( ${moodLayout[best - 1]} )`,
    worstDay: `${worstDate} ( ${moodLayout[worst - 1]} )`,
    streak,
    commonMood,
    frequency: freq,
  };
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#121110",
    padding: 20,
  },
  header: {
    color: "#EAE3D7",
    fontSize: 32,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  card: {
    backgroundColor: "#1c1817",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  label: {
    color: "#C7BFB2",
    fontSize: 16,
    marginBottom: 4,
    fontFamily: "serif",
  },
  value: {
    color: "#EAE3D7",
    fontSize: 18,
    fontFamily: "serif",
  },
});
