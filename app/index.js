import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getHasOpened, setHasOpened } from "../utils/storage.js";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const opened = await getHasOpened();

      const today = new Date().toISOString().slice(0, 10);

      if (opened === `true-${today}`) {
        router.push(`/home/home`);
      } else {
        await setHasOpened();
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null;

  function openForDate() {
    const today = new Date().toISOString().slice(0, 10);
    router.push(`mood/${today}`);
  }

  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { textAlign: "center" }]}>DayTone</Text>
          <Text style={[styles.tagline, { textAlign: "center" }]}>
            Every day has a tone, why not track yours?
          </Text>
        </View>

        <View style={styles.bottomArea}>
          <TouchableOpacity style={styles.btn} onPress={openForDate}>
            <Text style={styles.btnText}>Today's Entry</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            DayTone · {new Date().getFullYear()}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#121110" }, // darker colour
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 18 },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    // serif-like feel: system serif fallback (will use Georgia on many platforms)
    fontFamily: "serif",
    color: "#EAE3D7",
    letterSpacing: -0.6,
    textShadow: "0 0 10px #eae3d7be, 0 0 20px #eae3d7be, 0 0 30px #eae3d7be",
  },
  btn: {
    backgroundColor: "#333",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: "center",
    boxShadow: "0 0 12px 0px #35312E",
    alignSelf: "stretch",
  },
  bottomArea: {
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  btnText: {
    color: "#ddd4c5ff",
    fontSize: 18,
    fontFamily: "serif",
    fontWeight: "600",
    textShadow: "0 0 10px #c7bfb29e, 0 0 20px #c7bfb29e, 0 0 30px #c7bfb29e",
  },
  tagline: {
    color: "#C7BFB2",
    fontFamily: "serif",
    marginTop: 6,
    fontSize: 14,
    textShadow: "0 0 10px #c7bfb29e, 0 0 20px #c7bfb29e, 0 0 30px #c7bfb29e",
  },
  heatmapScroll: { paddingVertical: 14, alignItems: "flex-start" },
  footerText: {
    color: "#8a8178",
    fontSize: 12,
  },
});
