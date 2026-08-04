import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 200, 200, 200],
      lightColor: '#FF231F75',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      throw new Error('Project ID is not defined in app config');
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

    console.log(token);
  } catch (error) {
    token = `${error}`;
  }

  return token;
}

export default function NotificationsScreen() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channel, setChannel] = useState({});
  const [notification, setNotification] = useState(undefined);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const defaultStyles = useDefaultStyles();

  async function schedulePushNotification() {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();

    const timeToSchedule = new Date(selectedTime);
    const triggerHour = timeToSchedule.getHours();
    const triggerMinute = timeToSchedule.getMinutes();

    let triggerDate = new Date();
    triggerDate.setHours(triggerHour, triggerMinute, 0, 0);

    if (triggerDate <= now) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    const secondsUntilTrigger = Math.floor(
      (triggerDate.getTime() - now.getTime()) / 1000,
    );

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: 'Here is the notification body',
        data: { data: 'goes here' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilTrigger,
        repeats: true,
        channelId: 'default',
      },
    });
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token),
    );

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelAsync('default').then((value) =>
        setChannel(value ?? {}),
      );
    }

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);

        schedulePushNotification();
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [selectedTime]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      <View style={styles.pickerWrapper}>
        <Text style={styles.entryText}>Choose Reminder Time:</Text>
        <View style={styles.pickerContainer}>
          <DateTimePicker
            styles={{
              ...defaultStyles,

              container: { backgroundColor: '#1a1918' },
              header_text: {
                color: '#EAE3D7',
                fontFamily: 'serif',
                fontWeight: 'bold',
              },

              day_name_text: {
                color: '#C6BFB4',
                fontFamily: 'serif',
                fontWeight: '600',
              },

              day_text: { color: '#EAE3D7', fontFamily: 'serif' },

              today: {
                borderColor: '#80231f',
                borderWidth: 1.5,
                backgroundColor: 'transparent',
              },
              today_label: { color: '#EAE3D7', fontWeight: 'bold' },

              selected: {
                backgroundColor: '#80231f',
                borderRadius: 8,
              },
              selected_label: {
                color: '#F5E9E5',
                fontWeight: 'bold',
              },

              range_fill: {
                backgroundColor: '#383838',
              },
            }}
            mode='single'
            date={selectedTime}
            onChange={(params) => setSelectedTime(params.date)}
            timePicker={true}
            initialView='time'
            use12Hours={true}
          />
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={async () => {
            await schedulePushNotification();
          }}
        >
          <Text style={styles.deleteText}>Save Daily Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pickerContainer: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#121110',
    padding: 20,
    paddingTop: 50,
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
    backgroundColor: '#1f3980e9',
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
    padding: 4,
    paddingHorizontal: 8,
  },

  scroll: {
    flex: 1,
    borderRadius: 12,
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
    paddingBottom: 24,
  },
});
