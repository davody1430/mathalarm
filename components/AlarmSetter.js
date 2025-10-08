import React, { useState, useEffect } from 'react';
import { View, Button, Text, Platform, StyleSheet, TouchableOpacity } from 'react-native';
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
      // Not fatal — app can still function locally
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
        title: "\u23f0 \u0632\u0646\u06af \u0628\u06cc\u062f\u0627\u0631\u0628\u0627\u0634!",
        body: '\u0648\u0642\u062a \u0628\u06cc\u062f\u0627\u0631 \u0634\u062f\u0646\u0647! \u0628\u0631\u0627\u06cc \u062e\u0627\u0645\u0648\u0634 \u06a9\u0631\u062f\u0646 \u0632\u0646\u06af\u060c \u0645\u0633\u0626\u0644\u0647 \u0631\u06cc\u0627\u0632\u06cc \u0631\u0648 \u062d\u0644 \u06a9\u0646.',
        sound: true,
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
      if (result.type === 'success') {
        // DocumentPicker v10+ returns { type, uri, name }
        onSoundPick(result.uri, result.name || 'custom');
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
      <Text style={styles.header}>\u0633\u0627\u0639\u062a \u0632\u0646\u06AF\u200c\u062f\u0627\u0631 \u0631\u06cc\u0627\u0632\u06cc</Text>
      
      {alarm && <Text style={styles.alarmText}>\u0632\u0646\u06AF \u0628\u0631\u0627\u06CC \u0633\u0627\u0639\u062A {alarm} \u062A\u0646\u0632\u06CC\u0645 \u0634\u062F</Text>}
      
      <TouchableOpacity style={styles.button} onPress={() => setShow(true)}>
        <Text style={styles.buttonText}>{alarm ? "\u062a\u063a\u06cc\u06cc\u0631 \u0632\u0645\u0627\u0646 \u0632\u0646\u06AF" : "\u062a\u0646\u0632\u06CC\u0645 \u0632\u0646\u06AF"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={pickSound}>
        <Text style={styles.buttonText}>\u0627\u0646\u062a\u062e\u0627\u0628 \u0635\u062f\u0627\u06CC \u0632\u0646\u06AF</Text>
      </TouchableOpacity>
      {soundName && <Text style={styles.soundNameText}>\u0635\u062f\u0627\u06CC \u0641\u0639\u0644\u06CC: {soundName}</Text>}

      {show && (
        <DateTimePicker
          value={new Date(new Date().getTime() + 60000)}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
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
