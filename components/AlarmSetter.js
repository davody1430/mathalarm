import React, { useState, useEffect } from 'react';
import { View, Button, Text, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AlarmSetter({ onAlarmTrigger }) {
  const [alarm, setAlarm] = useState(null);

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      const cur = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (alarm === cur) onAlarmTrigger();
    }, 60000);
    return () => clearInterval(t);
  }, [alarm]);

  const pickTime = async () => {
    if (Platform.OS === 'android') {
      const { action, hour, minute } = await TimePickerAndroid.open({ is24Hour: true });
      if (action !== TimePickerAndroid.dismissedAction) {
        const time = `${hour}:${String(minute).padStart(2, '0')}`;
        setAlarm(time);
        AsyncStorage.setItem('alarm', time);
      }
    } else {
      // iOS یا وقتی TimePicker در دسترس نیست
      const now = new Date();
      const time = `${now.getHours()}:${String(now.getMinutes() + 1).padStart(2, '0')}`;
      setAlarm(time);
      AsyncStorage.setItem('alarm', time);
    }
  };

  return (
    <View style={{ padding: 40 }}>
      <Button title="تنظیم زنگ" onPress={pickTime} />
      {alarm && <Text style={{ marginTop: 10 }}>زنگ تنظیم شده: {alarm}</Text>}
    </View>
  );
}