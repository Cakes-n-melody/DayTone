import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export const exportAsJson = async () => {
  try {
    const moods = await AsyncStorage.getItem('DAYTONE_MOODS_V1');
    if (!moods) {
      alert('No moods found to export.');
      return;
    }
    const fileName = 'Backup.json';
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, moods, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      alert('Sharing is not available on this device.');
      return;
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Share your moods backup',
      UTI: 'public.json',
    });
  } catch (error) {
    console.error('Error exporting moods:', error);
    alert('An error occurred while exporting moods.');
  }
};

export const importFromJson = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    if (result.canceled) {
      return null;
    }
    const fileUri = result.assets[0].uri;

    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    let parsedContent;
    try {
      parsedContent = JSON.parse(fileContent);
    } catch (parseError) {
      alert('The selected file is not a valid JSON file.');
      return null;
    }

    await AsyncStorage.setItem(
      'DAYTONE_MOODS_V1',
      JSON.stringify(parsedContent),
    );
    alert('Moods imported successfully!');
    return parsedContent;
  } catch (error) {
    console.error('Error importing moods:', error);
    alert('An error occurred while importing moods.');
    return null;
  }
};

const MOODS_KEY = 'DAYTONE_MOODS_V1';
const DELETED_MOODS_KEY = 'DAYTONE_DELETED_MOODS_V1';

export const moodLayout = ['Awful.', 'Meh.', 'Okay.', 'Good.', 'Fantastic.'];
export const month = new Date().getMonth() + 1;

function normalizeColourFromMood(mood) {
  const map = {
    1: '#8a241f',
    2: '#b65a3f',
    3: '#cdaa6b',
    4: '#9fb987',
    5: '#6a8c6e',
  };
  return map[mood] || '#ece7df';
}

export var quoteNumber = Math.floor(Math.random() * 172);

export async function getHasOpened() {
  return await AsyncStorage.getItem('hasOpened');
}

export async function setHasOpened() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(today);
  quoteNumber = Math.floor(Math.random() * 172);
  console.log(quoteNumber);
  return AsyncStorage.setItem('hasOpened', `true-${today}`);
}

export async function getAllMoods() {
  try {
    const raw = await AsyncStorage.getItem(MOODS_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to get moods from storage', error);
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
      note: note || '',
    };
    const merged = { ...moods, [date]: payload };
    await AsyncStorage.setItem(MOODS_KEY, JSON.stringify(merged));
    return merged;
  } catch (error) {
    console.error('Failed to save mood to storage', error);
    return null;
  }
}

export async function getDeletedMoods() {
  try {
    const raw = await AsyncStorage.getItem(DELETED_MOODS_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to get Deleted moods', error);
    return {};
  }
}

export async function deleteMood(date) {
  try {
    const moods = await getAllMoods();
    const deletedMoods = await getDeletedMoods();
    if (moods[date]) {
      deletedMoods[date] = moods[date];
      console.log(deletedMoods);
      delete moods[date];
    }
    await AsyncStorage.setItem(DELETED_MOODS_KEY, JSON.stringify(deletedMoods));
    await AsyncStorage.setItem(MOODS_KEY, JSON.stringify(moods));
    return moods;
  } catch (error) {
    console.error('Failed to delete mood from storage', error);
    return null;
  }
}

export async function permanentlyDeleteMood() {
  try {
    const emptyTrash = {};

    await AsyncStorage.setItem(DELETED_MOODS_KEY, JSON.stringify(emptyTrash));

    return emptyTrash;
  } catch (error) {
    console.error('Failed to permanently delete mood from storage', error);
    return null;
  }
}

export async function saveSetting(key, value) {
  try {
    await AsyncStorage.setItem(`@setting_${key}`, JSON.stringify(value));
    console.log(`Saved ${key}`, value);
  } catch (error) {
    console.error(`Failed to save setting ${key}`);
  }
}

export async function getSetting(key, defaultValue = null) {
  try {
    const JsonValue = await AsyncStorage.getItem(`@setting_${key}`);
    if (JsonValue != null) {
      return JSON.parse(JsonValue);
    }
    return defaultValue;
  } catch (error) {
    console.error(`Failed to get ${key}`);
    return defaultValue;
  }
}

export async function removeDeletedMood(date) {
  try {
    const deletedMoods = await getDeletedMoods();

    // If the mood exists in the trash, delete it and save the updated trash
    if (deletedMoods && deletedMoods[date]) {
      delete deletedMoods[date];
      await AsyncStorage.setItem(
        DELETED_MOODS_KEY,
        JSON.stringify(deletedMoods),
      );
    }
  } catch (error) {
    console.error('Failed to remove mood from trash', error);
  }
}
