import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getSetting,
  permanentlyDeleteMood,
  saveSetting,
} from "../../utils/storage";

export default function settings() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function getPreferences() {
      const savedUsername = await getSetting("Username", "");
      setUsername(savedUsername);

      const usernames = await getSetting("Username");
      console.log("Usernames: ", usernames);
    }
    getPreferences();
  }, []);

  const setName = async (name) => {
    setUsername(name);
    await saveSetting("Username", name);

    console.log("Username just saved: ", name);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.card}>
        <Text style={styles.dateTitle}>Set Username ( optional )</Text>

        <Text style={styles.label}>Enter Username :</Text>
        <TextInput
          value={username}
          onChangeText={setName}
          placeholder="name here..."
          placeholderTextColor="#c7bfb29f"
          singleline
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.dateTitle}>Restore Deleted Moods : </Text>

        <TouchableOpacity
          style={[styles.Btn, { backgroundColor: "#1f3980e9" }]}
          onPress={() => {
            router.push(`../home/moodsRestore`);
          }}
        >
          <Text style={styles.deleteText}>Restore</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.dateTitle}>Permanently Delete Moods : </Text>

        <TouchableOpacity
          style={[styles.Btn, { backgroundColor: "#80231f" }]}
          onPress={permanentlyDeleteMood}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
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
  Btn: {
    marginTop: 10,
    paddingVertical: 6,
    backgroundColor: "#2c2c2c",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "#F5E9E5",
    fontFamily: "serif",
    fontWeight: "700",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#1a1918",
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
    marginBottom: 12,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#EAE3D7",
    textShadow: "0 0 10px #eae3d7be, 0 0 20px #eae3d7be, 0 0 30px #eae3d7be",
  },
  label: {
    marginTop: 4,
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
    marginTop: 10,
    minHeight: 40,
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
