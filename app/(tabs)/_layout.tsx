import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'pencil' : 'pencil-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="components-test"
        options={{
          title: 'Test',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'flask' : 'flask-outline'} size={24} color={color} />
          ),
          tabBarActiveTintColor: '#6366F1',
        }}
      />
    </Tabs>
  );
}