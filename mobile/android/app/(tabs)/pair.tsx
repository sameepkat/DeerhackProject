import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { useWebSocket } from '@/services/WebSocketContext';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function PairScreen() {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('9000');
  const [token, setToken] = useState('');
  const { connect, connected, lastMessage } = useWebSocket();
  const [status, setStatus] = useState('Not connected');

  const handleConnect = () => {
    setStatus('Connecting...');
    connect(ip, port, token);
    setStatus('Connected');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <IconSymbol name="link" size={64} color="#888" style={styles.logo} />
      <Text style={styles.title}>Pair with Server</Text>
      <TextInput
        style={styles.input}
        placeholder="Server IP (e.g. 192.168.1.5)"
        value={ip}
        onChangeText={setIp}
        autoCapitalize="none"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Port (default 9000)"
        value={port}
        onChangeText={setPort}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Pairing Token"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
      />
      <Button title="Connect" onPress={handleConnect} />
      <Text style={styles.status}>Status: {connected ? 'Connected' : status}</Text>
      <Text style={styles.subtitle}>Last Message:</Text>
      <Text style={styles.message}>{lastMessage}</Text>
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
  logo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  status: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    marginTop: 4,
    color: '#333',
  },
}); 