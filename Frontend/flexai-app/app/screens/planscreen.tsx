import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function PlanScreen() {
  const { plan } = useLocalSearchParams();
  const planData = JSON.parse(plan as string);

  // Split the plan text into sections
  const sections = planData.plan.split('\n\n').filter(Boolean);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Your Personalized Fitness Plan</Text>
      
      {sections.map((section: string, index: number) => {
        const [title, ...content] = section.split('\n');
        return (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{title.replace('**', '')}</Text>
            {content.map((line: string, lineIndex: number) => (
              <Text key={lineIndex} style={styles.item}>
                {line.replace('**', '')}
              </Text>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  item: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
}); 