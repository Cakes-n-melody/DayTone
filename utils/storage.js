import AsyncStorage from "@react-native-async-storage/async-storage";

const MOODS_KEY = "DAYTONE_MOODS_V1";

export const moodLayout = ["Awful.", "Meh.", "Okay.", "Good.", "Fantastic."];
export const month = new Date().getMonth() + 1;

function normalizeColourFromMood(mood) {
  const map = {
    1: "#8a241f",
    2: "#b65a3f",
    3: "#cdaa6b",
    4: "#9fb987",
    5: "#6a8c6e",
  };
  return map[mood] || "ece7df";
}

export var quoteNumber = Math.floor(Math.random() * 172);

export async function getHasOpened() {
  return await AsyncStorage.getItem("hasOpened");
}

export async function setHasOpened() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(today);
  quoteNumber = Math.floor(Math.random() * 172);
  console.log(quoteNumber);
  return AsyncStorage.setItem("hasOpened", `true-${today}`);
}

export async function getAllMoods() {
  try {
    const raw = await AsyncStorage.getItem(MOODS_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to get moods from storage", error);
    return {};
  }
}

export async function getMood(date) {
  const moods = await getAllMoods();
  return moods[date] || null;
}

export async function saveMood(date, { mood, note }) {
  try {
    const moods = await getAllMoods();
    const payload = {
      mood,
      moodColor: normalizeColourFromMood(mood),
      note: note || "",
    };
    const merged = { ...moods, [date]: payload };
    await AsyncStorage.setItem(MOODS_KEY, JSON.stringify(merged));
    return merged;
  } catch (error) {
    console.error("Failed to save mood to storage", error);
    return null;
  }
}

export async function deleteMood(date) {
  try {
    const moods = await getAllMoods();
    if (moods[date]) delete moods[date];
    await AsyncStorage.setItem(MOODS_KEY, JSON.stringify(moods));
    return moods;
  } catch (error) {
    console.error("Failed to delete mood from storage", error);
    return null;
  }
}
