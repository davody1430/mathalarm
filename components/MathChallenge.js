import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { generateMathProblem } from '../utils/mathGenerator';

export default function MathChallenge({ onCorrect }) {
  const [prob, setProb] = useState(generateMathProblem());
  const [val, setVal] = useState('');

  const check = () => {
    if (parseInt(val, 10) === prob.answer) {
      onCorrect();
    } else {
      alert('جواب اشتباه! دوباره امتحان کن.');
      setVal(''); // Clear input on wrong answer
      setProb(generateMathProblem()); // Generate a new problem
    }
  };

  useEffect(() => {
    setProb(generateMathProblem());
  }, []);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>برای خاموش کردن زنگ معادله رو حل کن:</Text>
      <Text style={styles.math}>{prob.question} = ؟</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={val}
        onChangeText={setVal}
        placeholder="پاسخ"
        placeholderTextColor="#666"
        autoFocus={true}
      />
      <TouchableOpacity style={styles.button} onPress={check}>
        <Text style={styles.buttonText}>ثبت</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#1c1c1e'
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  math: {
    fontSize: 48,
    marginVertical: 20,
    fontWeight: 'bold',
    color: '#f39c12'
  },
  input: {
    borderBottomWidth: 2,
    borderColor: '#3498db',
    width: 120,
    textAlign: 'center',
    fontSize: 36,
    marginBottom: 30,
    paddingVertical: 10,
    color: '#fff',
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});