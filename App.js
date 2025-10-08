import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import AlarmSetter from './components/AlarmSetter';
import MathChallenge from './components/MathChallenge';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DEFAULT_SOUND = require('./assets/alarm.mp3');
const SOUND_URI_KEY = 'alarm_sound_uri';
const SOUND_NAME_KEY = 'alarm_sound_name';

export default function App() {
  const [ring, setRing] = useState(false);
  const [sound, setSound] = useState(null);
  const [alarmSoundUri, setAlarmSoundUri] = useState(null);
  const [alarmSoundName, setAlarmSoundName] = useState('Default');

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Load custom sound from storage
    const loadSound = async () => {
      try {
        const uri = await AsyncStorage.getItem(SOUND_URI_KEY);
        const name = await AsyncStorage.getItem(SOUND_NAME_KEY);
        if (uri) setAlarmSoundUri(uri);
        if (name) setAlarmSoundName(name);
      } catch (e) {
        console.warn('Error loading sound from storage', e);
      }
    };
    loadSound();

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      onTrigger();
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      onTrigger();
    });

    return () => {
      try {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      } catch (e) {}
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handleSoundPick = async (uri, name) => {
    setAlarmSoundUri(uri);
    setAlarmSoundName(name);
    try {
      await AsyncStorage.setItem(SOUND_URI_KEY, uri);
      await AsyncStorage.setItem(SOUND_NAME_KEY, name);
    } catch (e) {
      console.warn('Error saving sound selection', e);
    }
  };

  const play = async () => {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const soundSource = alarmSoundUri ? { uri: alarmSoundUri } : DEFAULT_SOUND;
      const { sound } = await Audio.Sound.createAsync(soundSource);
      setSound(sound);
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
    } catch (e) {
      console.warn('Error playing sound', e);
    }
  };

  const stop = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (e) {
        /* ignore */
      }
      setSound(null);
    }
  };

  const onTrigger = () => { setRing(true); play(); };
  const onSolve = () => { stop(); setRing(false); };

  return (
    <View style={styles.container}>
      {ring ? <MathChallenge onCorrect={onSolve} /> : <AlarmSetter onSoundPick={handleSoundPick} soundName={alarmSoundName} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1e' },
});