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
        options={{ href: null }}
      />
      <Tabs.Screen
        name="practice"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="features"
        options={{
          title: 'Modules',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
          ),
          tabBarActiveTintColor: '#4CAF50',
        }}
      />
      <Tabs.Screen
        name="components-test"
        options={{ href: null }}
      />
      {}
      <Tabs.Screen
        name="handwriting"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="storytelling"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="voice-feedback"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="text-to-image"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={24} color={color} />
          ),
          tabBarActiveTintColor: '#FF9800',
        }}
      />
    </Tabs>
  );
}