import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Modal } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useWebSocket } from '@/services/WebSocketContext';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function PairScreen() {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('9000');
  const [token, setToken] = useState('');
  const [hostType, setHostType] = useState<string | null>(null);
  const { connect, connected, lastMessage } = useWebSocket();
  const [status, setStatus] = useState('Not connected');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const handleConnect = () => {
    setStatus('Connecting...');
    connect(ip, port, token);
    setStatus('Connected');
  };

  const handleScanQR = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    setScannerVisible(true);
    setScanned(false);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setScannerVisible(false);
    try {
      const parsed = JSON.parse(data);
      if (
        typeof parsed.server_ip === 'string' &&
        typeof parsed.port_no === 'number' &&
        (typeof parsed.pairing_token === 'number' || typeof parsed.pairing_token === 'string')
      ) {
        setIp(parsed.server_ip);
        setPort(parsed.port_no.toString());
        setToken(parsed.pairing_token.toString());
        setHostType(typeof parsed.host === 'string' ? parsed.host : null);
        setStatus('QR code scanned! Connecting...');
        connect(parsed.server_ip, parsed.port_no.toString(), parsed.pairing_token.toString());
      } else {
        setStatus('Invalid QR code format');
      }
    } catch {
      setStatus('Failed to parse QR code');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <IconSymbol name="chevron.right" size={64} color="#888" style={styles.logo} />
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
      <View style={{ height: 12 }} />
      <Button title="Scan QR" onPress={handleScanQR} />
      <Text style={styles.status}>Status: {connected ? 'Connected' : status}</Text>
      {hostType && (
        <Text style={styles.hostType}>Host type: {hostType}</Text>
      )}
      <Text style={styles.subtitle}>Last Message:</Text>
      <Text style={styles.message}>{lastMessage}</Text>
      <Modal visible={scannerVisible} animationType="slide">
        <View style={styles.scannerContainer}>
          {hasPermission === false ? (
            <Text>No access to camera</Text>
          ) : (
            <CameraView
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              style={StyleSheet.absoluteFillObject}
            />
          )}
          <Button title="Cancel" onPress={() => setScannerVisible(false)} />
        </View>
      </Modal>
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
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  hostType: {
    marginTop: 8,
    fontSize: 15,
    color: '#1976d2',
    fontWeight: 'bold',
  },
}); 