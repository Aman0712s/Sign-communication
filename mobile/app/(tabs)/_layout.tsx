import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#6b6b80',
        tabBarStyle: {
          backgroundColor: '#111118',
          borderTopColor: 'rgba(255,255,255,0.06)',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#0a0a0f',
        },
        headerTintColor: '#f0f0f5',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="🏠" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="text-to-sign"
        options={{
          title: 'Text → Sign',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="✋" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sign-to-text"
        options={{
          title: 'Sign → Text',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="📝" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="⚙️" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}
