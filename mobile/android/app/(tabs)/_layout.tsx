import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="clipboard"
        options={{
          title: 'Clipboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.on.clipboard" color={color} />, // Placeholder icon
        }}
      />
      <Tabs.Screen
        name="filetransfer"
        options={{
          title: 'File Transfer',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="arrow.up.arrow.down" color={color} />, // Placeholder icon
        }}
      />
      <Tabs.Screen
        name="remoteinput"
        options={{
          title: 'Remote Input',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cursorarrow.rays" color={color} />, // Placeholder icon
        }}
      />
      <Tabs.Screen
        name="mediacontrol"
        options={{
          title: 'Media Control',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="playpause" color={color} />, // Placeholder icon
        }}
      />
      <Tabs.Screen
        name="pair"
        options={{
          title: 'Pair',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="link" color={color} />, // Placeholder icon
        }}
      />
    </Tabs>
  );
}
