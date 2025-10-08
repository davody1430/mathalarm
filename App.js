import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AlarmSetter from './components/AlarmSetter';
import MathChallenge from './components/MathChallenge';
import { Audio } from 'expo-av';

export default function App() {
  const [ring, setRing] = useState(false);
  const [sound, setSound] = useState(null);

  const play = async () => {
    const { sound } = await Audio.Sound.createAsync(require('./assets/alarm.mp3'));
    setSound(sound);
    await sound.playAsync();
  };

  const stop = async () => {
    if (sound) { await sound.stopAsync(); setSound(null); }
  };

  const onTrigger = () => { setRing(true); play(); };
  const onSolve = () => { stop(); setRing(false); };

  return (
    <View style={styles.container}>
      {ring ? <MathChallenge onCorrect={onSolve} /> : <AlarmSetter onAlarmTrigger={onTrigger} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
});