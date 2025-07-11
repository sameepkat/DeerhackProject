import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useWebSocket } from '@/services/WebSocketContext';

export default function ClipboardScreen() {
  const { send, connected } = useWebSocket();
  const [clipboardValue, setClipboardValue] = useState('');
  const [status, setStatus] = useState('');

  const handleClipboardSync = async () => {
    try {
      const value = await Clipboard.getStringAsync();
      console.log(value);
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

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Clipboard Screen</Text>
      <Button title="Clipboard Sync" onPress={handleClipboardSync} />
      <Text style={styles.status}>{status}</Text>
      <Text style={styles.label}>Last clipboard value:</Text>
      <Text style={styles.clipboard}>{clipboardValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    marginBottom: 16,
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