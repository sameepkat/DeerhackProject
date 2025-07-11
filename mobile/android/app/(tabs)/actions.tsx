import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useWebSocket } from '@/services/WebSocketContext';

export default function ActionsScreen() {
  const { send, connected } = useWebSocket();
  const [clipboardValue, setClipboardValue] = useState('');
  const [status, setStatus] = useState('');

  const handleClipboardSync = async () => {
    try {
      const value = await Clipboard.getStringAsync();
      setClipboardValue(value);
      if (connected) {
        send(JSON.stringify({ type: 'clipboard', data: value }));
        setStatus('Clipboard sent!');
      } else {
        setStatus('Not connected to server');
      }
    } catch (e) {
      setStatus('Failed to read clipboard');
    }
  };

  // Placeholder handlers for other features
  const handleMediaControl = () => {
    if (connected) {
      send(JSON.stringify({ type: 'media', action: 'playpause' }));
      setStatus('Media control sent!');
    } else {
      setStatus('Not connected to server');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Actions</Text>
      <Button title="Clipboard Sync" onPress={handleClipboardSync} />
      <View style={styles.button}>
        <Button title="Media Control (Play/Pause)" onPress={handleMediaControl} />
      </View>
      {/* Add more feature buttons here */}
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
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  button: {
    marginTop: 12,
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