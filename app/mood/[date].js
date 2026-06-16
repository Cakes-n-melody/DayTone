import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  deleteMood,
  getMood,
  moodLayout,
  saveMood,
} from '../../utils/storage.js';

const MOOD_PALETTE = {
  1: '#8a241f',
  2: '#b65a3f',
  3: '#cdaa6b',
  4: '#9fb987',
  5: '#6a8c6e',
};
export default function MoodEntry() {
  const { date } = useLocalSearchParams(); // YYYY-MM-DD
  const router = useRouter();
  const [note, setNote] = useState('');
  const [existing, setExisting] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);

  useEffect(() => {
    (async () => {
      const e = await getMood(date);
      if (e) {
        setExisting(e);
        setNote(e.note || '');
      }
    })();
  }, [date]);

  async function pickMood(moodValue) {
    await saveMood(date, {
      mood: moodValue,
      moodColor: MOOD_PALETTE[moodValue],
      note,
    });
    router.replace('/');
  }

  async function save() {
    if (!selectedMood) return;

    await saveMood(date, {
      mood: selectedMood,
      moodColor: MOOD_PALETTE[selectedMood],
      note,
    });
    router.replace('/');
  }

  async function clear() {
    await deleteMood(date);
    router.replace('/');
  }

  return (
    <View style={styles.shell}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.dateTitle}>{new Date(date).toDateString()}</Text>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>How was your day?</Text>
        <View style={styles.row}>
          {Object.entries(MOOD_PALETTE).map(([k, c]) => {
            const moodKey = Number(k);
            const isSelected = selectedMood === moodKey;

            return (
              <TouchableOpacity
                key={k}
                style={styles.moodOption}
                onPress={() => setSelectedMood(moodKey)}
              >
                <View
                  style={[
                    styles.moodCircle,
                    { backgroundColor: c },
                    isSelected && styles.selectedCircle,
                  ]}
                />

                <Text
                  style={[
                    styles.moodLabelText,
                    { color: isSelected ? '#EAE3D7' : '#5c5751' },
                  ]}
                >
                  {moodLayout[moodKey - 1]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: 24 }]}>Note (optional)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder='Something brief about the day...'
          placeholderTextColor='#c7bfb29f'
          multiline
          textAlignVertical='top'
          style={styles.input}
        />

        <View style={styles.actions}>
          {existing && (
            <TouchableOpacity style={styles.clearBtn} onPress={clear}>
              <Text style={styles.clearText}>Delete Entry</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.saveBtn,
              !selectedMood && styles.saveBtnDisabled,
              !existing && { maxWidth: '100%' },
            ]}
            onPress={save}
            disabled={!selectedMood}
          >
            <Text style={styles.saveBtnText}>Save Entry</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: '#1A1817', padding: 20, paddingTop: 50 },
  card: {
    backgroundColor: '#242220',
    borderRadius: 14,
    padding: 18,
    // subtle shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 4 },
    }),
  },
  saveBtn: {
    backgroundColor: '#EAE3D7',
    paddingVertical: 14,
    paddingHorizontal: 24,
    maxWidth: '48%',
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#3b3a38', // Grayed out until they pick a mood
  },
  saveBtnText: {
    color: '#121110',
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 16,
  },
  selectedCircle: {
    opacity: 1,
    borderWidth: 3,
    borderColor: '#EAE3D7',
    shadowColor: '#EAE3D7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  moodOption: {
    alignItems: 'center',
  },
  moodCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    opacity: 0.5, // Dims unselected
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#EAE3D7',
    textShadow: '0 0 10px #eae3d7be, 0 0 20px #eae3d7be, 0 0 30px #eae3d7be',
  },
  label: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'serif',
    marginBottom: 12,
    fontWeight: '600',
    color: '#C7BFB2',
    textShadow: '0 0 10px #c7bfb29f, 0 0 20px #c7bfb29f, 0 0 30px #c7bfb29f',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  swatch: {
    width: 64,
    height: 64,
    borderRadius: 12,
    boxShadow: '0 0 12px 0px #35312E',
  },
  input: {
    marginTop: 8,
    minHeight: 88,
    borderWidth: 1,
    borderColor: '#35312E',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#2C2A28',
    color: '#978F85',
    textShadow: '0 0 10px #978f85c0, 0 0 20px #978f85c0, 0 0 30px #978f85c0',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
  },
  cancel: { color: '#6b6158', fontWeight: '700' },
  clearBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#80231f',
    paddingVertical: 14,
    paddingHorizontal: 24,
    maxWidth: '48%',
    borderRadius: 12,
  },
  clearText: {
    color: '#EAE3D7',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 16,
  },
});
