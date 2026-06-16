import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { moodColors } from "../utils/storage";

export default function MoodModal({ visible, onClose, date, onMoodSelect }) {
  const [selectedMood, setSelectedMood] = useState(null);

  useEffect(() => {
    if (!visible) return;
    const loadMood = async () => {
      const savedMood = await AsyncStorage.getItem(`mood-${date}`);
      if (savedMood) setSelectedMood(savedMood);
    };
    loadMood();
  }, [visible]);

  const handleSelect = async (color) => {
    setSelectedMood(color);
    await AsyncStorage.setItem(`mood-${date}`, color);
    onMoodSelect(color);
    onClose();
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>How was your day?</Text>
          <Text style={styles.subtitle}>{date}</Text>

          <View style={styles.colorGrid}>
            {moodColors.map((color, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelect(color)}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: color,
                    borderWidth: selectedMood === color ? 3 : 0,
                    borderColor: "#333",
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 6,
  },
  subtitle: {
    color: "#666",
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 14,
  },
  colorOption: {
    width: 55,
    height: 55,
    borderRadius: 12,
  },
  closeButton: {
    marginTop: 24,
  },
  closeText: {
    color: "#555",
    fontSize: 16,
  },
});