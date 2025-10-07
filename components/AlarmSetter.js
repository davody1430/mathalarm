import React, { useState, useEffect } from 'react';
import { View, Text, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as DocumentPicker from 'expo-document-picker';

// Permission and notification channel setup (assuming it's called once)
async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
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
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

export default function AlarmSetter({ onSoundPick, soundName }) {
  const [alarm, setAlarm] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();
    AsyncStorage.getItem('alarm').then(savedTime => {
      if (savedTime) setAlarm(savedTime);
    });
  }, []);

  const scheduleAlarm = async (time) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const trigger = new Date(time);
    if (trigger.getTime() <= Date.now()) {
        trigger.setDate(trigger.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ زنگ بیدارباش!",
        body: 'وقت بیدار شدنه! برای خاموش کردن زنگ، مسئله ریاضی رو حل کن.',
        sound: true, // Use default notification sound
      },
      trigger,
    });
    const displayTime = `${trigger.getHours()}:${String(trigger.getMinutes()).padStart(2, '0')}`;
    setAlarm(displayTime);
    AsyncStorage.setItem('alarm', displayTime);
  };

  const pickSound = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: false,
      });
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        onSoundPick(result.assets[0].uri, result.assets[0].name);
      }
    } catch (err) {
      console.error('Error picking sound:', err);
    }
  };

  const onChange = (event, selectedDate) => {
    setShow(false); // Hide picker immediately
    if (selectedDate) {
      scheduleAlarm(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ساعت زنگ‌دار ریاضی</Text>
      
      {alarm && <Text style={styles.alarmText}>زنگ برای ساعت {alarm} تنظیم شد</Text>}
      
      <TouchableOpacity style={styles.button} onPress={() => setShow(true)}>
        <Text style={styles.buttonText}>{alarm ? "تغییر زمان زنگ" : "تنظیم زنگ"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={pickSound}>
        <Text style={styles.buttonText}>انتخاب صدای زنگ</Text>
      </TouchableOpacity>
      {soundName && <Text style={styles.soundNameText}>صدای فعلی: {soundName}</Text>}

      {show && (
        Platform.OS === 'web' ? (
          <Text style={styles.platformNotice}>
            تنظیم زمان در نسخه وب پشتیبانی نمی‌شود. لطفا از اپلیکیشن موبایل استفاده کنید.
          </Text>
        ) : (
          <DateTimePicker
            value={new Date(new Date().getTime() + 60000)}
            mode="time"
            is24Hour={true}
            display={'default'}
            onChange={onChange}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1c1c1e',
        padding: 20,
    },
    platformNotice: {
        color: '#ffcc00',
        textAlign: 'center',
        marginVertical: 20,
        fontSize: 16,
        fontStyle: 'italic',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 40,
    },
    alarmText: {
        marginTop: 20,
        fontSize: 22,
        fontWeight: '600',
        color: '#a9a9a9',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#007aff',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginBottom: 20,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    soundNameText: {
        color: '#888',
        marginTop: 10,
        fontStyle: 'italic',
    }
});