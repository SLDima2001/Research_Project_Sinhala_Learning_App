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
        options={{
          title: 'Test',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'flask' : 'flask-outline'} size={24} color={color} />
          ),
          tabBarActiveTintColor: '#6366F1',
        }}
      />
      {/* Hidden Screens for navigation from features */}
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
        options={{ href: null }}
      />
    </Tabs>
  );
}