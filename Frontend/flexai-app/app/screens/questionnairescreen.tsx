import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function QuestionnaireScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Basic Information
  const [ageRange, setAgeRange] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  
  // Primary Fitness Goal
  const [fitnessGoal, setFitnessGoal] = useState('');
  
  // Experience Level
  const [experienceLevel, setExperienceLevel] = useState('');
  
  // Current Activity Level
  const [activityLevel, setActivityLevel] = useState('');
  
  // Time Availability
  const [trainingDays, setTrainingDays] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  
  // Equipment Access
  const [equipmentAccess, setEquipmentAccess] = useState('');
  
  // Dietary Preferences
  const [dietaryPreference, setDietaryPreference] = useState('');
  
  // Health Considerations
  const [hasInjuries, setHasInjuries] = useState('');
  const [injuryDetails, setInjuryDetails] = useState('');
  const [focusAreas, setFocusAreas] = useState([]);
  
  // Supplementary Questions
  const [workoutEnvironment, setWorkoutEnvironment] = useState('');
  const [varietyPreference, setVarietyPreference] = useState('3');
  const [trackMetrics, setTrackMetrics] = useState('');
  const [sleepHours, setSleepHours] = useState('');

  // Dropdown state
  const [activeDropdown, setActiveDropdown] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const dropdownOptions = {
    ageRange: ['18-22', '23-30', '31-40', '41-50', '51+'],
    gender: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
    fitnessGoal: ['Build muscle/bodybuilding', 'Lose weight/fat', 'Improve cardiovascular fitness', 'Increase strength', 'Improve flexibility/mobility', 'General fitness/maintenance', 'Sport-specific training'],
    experienceLevel: ['Beginner (less than 6 months)', 'Intermediate (6 months to 2 years)', 'Advanced (2+ years)'],
    activityLevel: ['Sedentary (little to no exercise)', 'Lightly active (1-3 days/week)', 'Moderately active (3-5 days/week)', 'Very active (6-7 days/week)', 'Extremely active (daily + physical job)'],
    trainingDays: ['2-3 days', '3-4 days', '5-6 days', '6-7 days'],
    workoutDuration: ['30 minutes', '45 minutes', '60 minutes', '90+ minutes'],
    equipmentAccess: ['Full gym access', 'Limited equipment', 'Bodyweight only'],
    dietaryPreference: ['Omnivore', 'Vegetarian', 'Vegan', 'Pescatarian'],
    hasInjuries: ['Yes', 'No'],
    workoutEnvironment: ['Gym', 'Home', 'Outdoors'],
    sleepHours: ['Less than 6 hours', '6-7 hours', '7-8 hours', '8+ hours']
  };

  const handleDropdownSelect = (value: string) => {
    switch (activeDropdown) {
      case 'ageRange': setAgeRange(value); break;
      case 'gender': setGender(value); break;
      case 'fitnessGoal': setFitnessGoal(value); break;
      case 'experienceLevel': setExperienceLevel(value); break;
      case 'activityLevel': setActivityLevel(value); break;
      case 'trainingDays': setTrainingDays(value); break;
      case 'workoutDuration': setWorkoutDuration(value); break;
      case 'equipmentAccess': setEquipmentAccess(value); break;
      case 'dietaryPreference': setDietaryPreference(value); break;
      case 'hasInjuries': setHasInjuries(value); break;
      case 'workoutEnvironment': setWorkoutEnvironment(value); break;
      case 'sleepHours': setSleepHours(value); break;
    }
    setDropdownVisible(false);
  };

  const renderDropdown = (label: string, field: string, value: string) => (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => {
          setActiveDropdown(field);
          setDropdownVisible(true);
        }}
      >
        <Text style={styles.dropdownButtonText}>
          {value || `Select ${label.toLowerCase()}`}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const handleSubmit = async () => {
    if (!ageRange || !height || !weight || !fitnessGoal || !experienceLevel || 
        !activityLevel || !trainingDays || !workoutDuration || !equipmentAccess || 
        !dietaryPreference || !workoutEnvironment || !sleepHours) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = 'http://10.226.24.237:5000';
      console.log('Sending data to:', API_URL);
      
      const requestData = {
        basicInfo: {
          ageRange,
          height,
          weight,
          gender,
        },
        fitnessGoal,
        experienceLevel,
        activityLevel,
        timeAvailability: {
          trainingDays,
          workoutDuration,
        },
        equipmentAccess,
        dietaryPreference,
        healthConsiderations: {
          hasInjuries,
          injuryDetails,
          focusAreas,
        },
        supplementary: {
          workoutEnvironment,
          varietyPreference: parseInt(varietyPreference),
          trackMetrics,
          sleepHours,
        }
      };

      console.log('Sending data:', requestData);

      const response = await fetch(`${API_URL}/get_plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log('Success! Plan received:', data);
      
      router.push({
        pathname: '/screens/planscreen',
        params: { plan: JSON.stringify(data) }
      });
    } catch (error: any) {
      console.error('Connection error:', error);
      Alert.alert(
        'Connection Error',
        'Could not connect to the server. Please make sure:\n\n' +
        '1. You are connected to the same WiFi network as your computer\n' +
        '2. The backend server is running\n' +
        '3. Try again in a few moments\n\n' +
        `Error details: ${error?.message || 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Fitness Questionnaire</Text>

      {/* Basic Information */}
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      {renderDropdown('Age Range', 'ageRange', ageRange)}
      {renderDropdown('Gender (Optional)', 'gender', gender)}

      <Text style={styles.label}>Height (in cm)</Text>
      <TextInput
        style={styles.input}
        value={height}
        onChangeText={setHeight}
        placeholder="e.g. 175"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Weight (in kg)</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        placeholder="e.g. 70"
        keyboardType="numeric"
      />

      {/* Primary Fitness Goal */}
      <Text style={styles.sectionTitle}>Primary Fitness Goal</Text>
      {renderDropdown('Select your goal', 'fitnessGoal', fitnessGoal)}

      {/* Experience Level */}
      <Text style={styles.sectionTitle}>Experience Level</Text>
      {renderDropdown('Select experience level', 'experienceLevel', experienceLevel)}

      {/* Current Activity Level */}
      <Text style={styles.sectionTitle}>Current Activity Level</Text>
      {renderDropdown('Select activity level', 'activityLevel', activityLevel)}

      {/* Time Availability */}
      <Text style={styles.sectionTitle}>Time Availability</Text>
      {renderDropdown('Training Days per Week', 'trainingDays', trainingDays)}
      {renderDropdown('Workout Duration', 'workoutDuration', workoutDuration)}

      {/* Equipment Access */}
      <Text style={styles.sectionTitle}>Equipment Access</Text>
      {renderDropdown('Select equipment access', 'equipmentAccess', equipmentAccess)}

      {/* Dietary Preferences */}
      <Text style={styles.sectionTitle}>Dietary Preferences</Text>
      {renderDropdown('Select dietary preference', 'dietaryPreference', dietaryPreference)}

      {/* Health Considerations */}
      <Text style={styles.sectionTitle}>Health Considerations</Text>
      {renderDropdown('Any injuries or conditions?', 'hasInjuries', hasInjuries)}

      {hasInjuries === 'Yes' && (
        <TextInput
          style={styles.input}
          value={injuryDetails}
          onChangeText={setInjuryDetails}
          placeholder="Please describe your injuries/conditions"
        />
      )}

      {/* Supplementary Questions */}
      <Text style={styles.sectionTitle}>Supplementary Questions</Text>
      {renderDropdown('Preferred Workout Environment', 'workoutEnvironment', workoutEnvironment)}
      {renderDropdown('Sleep Hours per Night', 'sleepHours', sleepHours)}

      <View style={styles.buttonContainer}>
        <Button 
          title={isLoading ? "Generating Plan..." : "Get Your Plan"} 
          onPress={handleSubmit} 
          color="#5DB075"
          disabled={isLoading}
        />
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              {dropdownOptions[activeDropdown as keyof typeof dropdownOptions]?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownOption}
                  onPress={() => handleDropdownSelect(option)}
                >
                  <Text style={styles.dropdownOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 16,
    color: '#333',
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
  dropdownButton: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginTop: 4,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  dropdownOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
}); 