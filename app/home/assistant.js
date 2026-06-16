import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { getAllMoods, getSetting } from '../../utils/storage.js';

export default function Assistant() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [todaysMood, setTodaysMood] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTodaysMood = async () => {
      const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
      const moods = await getAllMoods();
      setTodaysMood(moods[today]);
    };
    loadTodaysMood();
  }, []);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const user = await getSetting('Username');
    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: user,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('https://daytone-ai.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });

      const data = await response.json();

      if (data.reply) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: data.reply,
          sender: 'DayTone AI',
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error('No reply from AI');
      }
    } catch (error) {
      console.error('Error communicating with AI:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, something went wrong. Please try again later.',
        sender: 'DayTone AI',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderText = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === 'DayTone AI' ? styles.aiBubble : styles.userBubble,
      ]}
    >
      {item.sender === 'DayTone AI' ? (
        <Markdown style={markdownStyles}>{item.text}</Markdown>
      ) : (
        <Text style={styles.userText}>{item.text}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>
      <Text style={styles.title}>Your Assistant</Text>

      <View
        style={{
          flex: 1,
          width: '100%',
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: '#1a1918',
          padding: 10,
        }}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderText}
          contentContainerStyle={styles.scroll}
          style={{
            flex: 1,
            borderRadius: 12,
          }}
        />
      </View>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder='Type your thoughts...'
          placeholderTextColor='#888'
          placeholderStyle={{ fontFamily: 'serif' }}
          value={inputText}
          onChangeText={setInputText}
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color='#121110' />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121110',
    padding: 20,
    paddingTop: 50,
  },

  userBubble: {
    backgroundColor: '#2E2A24',
    alignSelf: 'flex-end',
  },

  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    maxWidth: '80%',
  },

  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 26,
  },

  input: {
    flex: 1,
    backgroundColor: '#1a1918',
    color: '#EAE3D7',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
  },

  sendButton: {
    backgroundColor: '#EAE3D7',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonText: {
    color: '#121110',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'serif',
  },

  userText: {
    color: '#EAE3D7',
    fontSize: 16,
    fontFamily: 'serif',
  },

  aiBubble: {
    backgroundColor: '#3A352E',
    alignSelf: 'flex-start',
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'serif',
    color: '#EAE3D7',
    textAlign: 'center',
    marginBottom: 20,
    textShadow: '0 0 10px #eae3d7be, 0 0 20px #eae3d7be',
  },

  deleteBtn: {
    marginTop: 10,
    paddingVertical: 6,
    backgroundColor: '#80231f',
    borderRadius: 8,
    alignItems: 'center',
  },

  datesBtn: {
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 6,
    backgroundColor: '#2b2b2b',
    borderRadius: 8,
    alignItems: 'center',
  },

  deleteText: {
    color: '#F5E9E5',
    fontFamily: 'serif',
    fontWeight: '700',
    fontSize: 14,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },

  datePicker: {
    backgroundColor: '#1a1918',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    width: '100%',
  },

  empty: {
    color: '#EAE3D7',
    textAlign: 'center',
    marginTop: 40,
    opacity: 0.7,
    fontSize: 16,
  },

  entryCard: {
    backgroundColor: '#1a1918',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
  },

  entryDate: {
    color: '#EAE3D7',
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: '700',
    marginBottom: 4,
  },

  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  moodDot: {
    width: 18,
    height: 18,
    borderRadius: 10,
    marginRight: 10,
  },

  entryMood: {
    color: '#C6BFB4',
    fontFamily: 'serif',
    fontSize: 14,
  },

  entryText: {
    color: '#EAE3D7',
    fontSize: 15,
    fontFamily: 'serif',
    lineHeight: 20,
    marginTop: 4,
  },
});

const markdownStyles = {
  body: {
    color: '#F5EFE6',
    fontSize: 16,
    fontFamily: 'serif',
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
};
