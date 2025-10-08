import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { generateMathProblem } from '../utils/mathGenerator';

export default function MathChallenge({ onCorrect }) {
  const [prob] = useState(generateMathProblem());
  const [val, setVal] = useState('');

  const check = () => {
    if (parseInt(val) === prob.answer) {
      onCorrect();
    } else {
      alert('جواب اشتباه! دوباره امتحان کن.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>برای خاموش کردن زنگ معادله رو حل کن:</Text>
      <Text style={styles.math}>{prob.question} = ؟</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={val}
        onChangeText={setVal}
      />
      <Button title="ثبت" onPress={check} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  title: { fontSize: 18, marginBottom: 10 },
  math: { fontSize: 32, marginVertical: 15 },
  input: { borderBottomWidth: 1, width: 80, textAlign: 'center', fontSize: 24 },
});