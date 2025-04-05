// QuestionnaireScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

export default function QuestionnaireScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');

  const handleSubmit = () => {
    const data = {
      name,
      age,
      goal,
      fitnessLevel,
    };

    console.log('User Input:', data);
    // Later: Send to backend or OpenAI
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Fitness Questionnaire</Text>

      <Text style={styles.label}>Your Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Hetansh"
      />

      <Text style={styles.label}>Your Age</Text>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={setAge}
        placeholder="e.g. 20"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Your Fitness Goal</Text>
      <TextInput
        style={styles.input}
        value={goal}
        onChangeText={setGoal}
        placeholder="e.g. Build Muscle / Lose Fat"
      />

      <Text style={styles.label}>Current Fitness Level</Text>
      <TextInput
        style={styles.input}
        value={fitnessLevel}
        onChangeText={setFitnessLevel}
        placeholder="e.g. Beginner / Intermediate"
      />

      <View style={styles.buttonContainer}>
        <Button title="Submit" onPress={handleSubmit} color="#5DB075" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginTop: 4,
    borderRadius: 6,
  },
  buttonContainer: {
    marginTop: 24,
  },
});
