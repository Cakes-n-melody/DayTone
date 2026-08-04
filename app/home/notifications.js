import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';
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

    alert('This notification will be sent in 60 seconds.');
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
  }, []);

  return (
    <View style={styles.container}>
      <Text>Your expo push token: {expoPushToken}</Text>
      <Text>{`Channel: ${channel?.name}`}</Text>

      <View style={styles.innerContainer}>
        <Text>Title: {notification?.request.content.title}</Text>
        <Text>Body: {notification?.request.content.body}</Text>
        <Text>Data: {JSON.stringify(notification?.request.content.data)}</Text>
      </View>

      <View style={styles.pickerWrapper}>
        <Text style={styles.pickerLabel}>Choose Reminder Time:</Text>
        <View style={styles.pickerContainer}>
          <DateTimePicker
            styles={defaultStyles}
            mode='single'
            date={selectedTime}
            onChange={(params) => setSelectedTime(params.date)}
            timePicker={true}
            initialView='time'
            use12Hours={true}
          />
        </View>

        <Button
          title='Save Daily Schedule'
          onPress={async () => {
            await schedulePushNotification();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
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
});
