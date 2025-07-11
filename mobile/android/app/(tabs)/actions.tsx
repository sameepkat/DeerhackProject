import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useWebSocket } from '@/services/WebSocketContext';
import { IconSymbol } from '@/components/ui/IconSymbol';

const features = [
  {
    key: 'clipboard',
    label: 'Clipboard Sync',
    icon: 'doc.on.clipboard',
    action: 'clipboard',
  },
  {
    key: 'media',
    label: 'Media Control',
    icon: 'playpause',
    action: 'media',
  },
  // Add more features here
];

export default function ActionsScreen() {
  const { send, connected } = useWebSocket();
  const [clipboardValue, setClipboardValue] = useState('');
  const [status, setStatus] = useState('');

  const handleFeaturePress = async (feature: typeof features[0]) => {
    if (!connected) {
      setStatus('Not connected to server');
      return;
    }
    if (feature.action === 'clipboard') {
      try {
        const value = await Clipboard.getStringAsync();
        setClipboardValue(value);
        send(JSON.stringify({ type: 'clipboard', data: value }));
        setStatus('Clipboard sent!');
      } catch (e) {
        setStatus('Failed to read clipboard');
      }
    } else if (feature.action === 'media') {
      send(JSON.stringify({ type: 'media', action: 'playpause' }));
      setStatus('Media control sent!');
    }
    // Add more feature actions here
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <IconSymbol name="bolt" size={64} color="#888" style={styles.logo} />
      <Text style={styles.title}>Actions</Text>
      <View style={styles.grid}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.key}
            style={styles.card}
            onPress={() => handleFeaturePress(feature)}
            activeOpacity={0.7}
          >
            <IconSymbol name={feature.icon} size={36} color="#444" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>{feature.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.status}>{status}</Text>
      <Text style={styles.label}>Last clipboard value:</Text>
      <Text style={styles.clipboard}>{clipboardValue}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  logo: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 16,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 20,
    margin: 8,
    width: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  status: {
    marginTop: 12,
    fontSize: 16,
    color: 'green',
  },
  label: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  clipboard: {
    fontSize: 14,
    marginTop: 4,
    color: '#333',
  },
}); 