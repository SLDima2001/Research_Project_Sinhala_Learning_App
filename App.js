import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from './screens/DashboardScreen';
import DifficultyScreen from './screens/DifficultyScreen';
import StoryScreen from './screens/StoryScreen';
import QuizScreen from './screens/QuizScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Difficulty"
          component={DifficultyScreen}
          options={{ title: 'Choose Difficulty', headerShown: false }}
        />
        <Stack.Screen name="Story" component={StoryScreen} options={{ title: 'Read Story' }} />
        <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz Time' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
