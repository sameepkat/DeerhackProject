import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useWebSocket } from '@/services/WebSocketContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { DeviceStorage, Device } from '@/services/DeviceStorage';
import { useFocusEffect } from '@react-navigation/native';

export default function PairScreen() {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('9000');
  const [token, setToken] = useState('');
  const [hostType, setHostType] = useState<string | null>(null);
  const { connect, connectToDevice, connected, lastMessage, connectedDevice, isAutoConnecting } = useWebSocket();
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

  // Load most recently connected device when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadMostRecentDevice = async () => {
        const devices = await DeviceStorage.getAllDevices();
        if (devices.length > 0) {
          // Sort by lastConnected (most recent first)
          const sortedDevices = devices.sort((a, b) => {
            const aTime = a.lastConnected || 0;
            const bTime = b.lastConnected || 0;
            return bTime - aTime;
          });
          
          const mostRecent = sortedDevices[0];
          setIp(mostRecent.ip);
          setPort(mostRecent.port);
          setToken(mostRecent.token);
          setHostType(mostRecent.hostType || null);
        }
      };
      
      loadMostRecentDevice();
    }, [])
  );

  const handleConnect = async () => {
    if (!ip || !port || !token) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setStatus('Connecting...');
    connect(ip, port, token);
    
    // Save device to storage
    const deviceId = DeviceStorage.generateDeviceId(ip, port);
    const device: Device = {
      id: deviceId,
      ip,
      port,
      token,
      hostType: hostType || undefined,
      name: hostType || `${ip}:${port}`,
      lastConnected: Date.now(),
    };
    
    await DeviceStorage.saveDevice(device);
    connectToDevice(device);
    setStatus('Connected and saved');
  };

  const handleScanQR = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    setScannerVisible(true);
    setScanned(false);
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setScannerVisible(false);
    try {
      const parsed = JSON.parse(data);
      if (
        typeof parsed.server_ip === 'string' &&
        typeof parsed.port_no === 'number' &&
        (typeof parsed.pairing_token === 'number' || typeof parsed.pairing_token === 'string')
      ) {
        const serverIp = parsed.server_ip;
        const portNo = parsed.port_no.toString();
        const pairingToken = parsed.pairing_token.toString();
        const hostTypeValue = typeof parsed.host === 'string' ? parsed.host : null;
        
        setIp(serverIp);
        setPort(portNo);
        setToken(pairingToken);
        setHostType(hostTypeValue);
        setStatus('QR code scanned! Connecting...');
        connect(serverIp, portNo, pairingToken);
        
        // Save device to storage
        const deviceId = DeviceStorage.generateDeviceId(serverIp, portNo);
        const device: Device = {
          id: deviceId,
          ip: serverIp,
          port: portNo,
          token: pairingToken,
          hostType: hostTypeValue || undefined,
          name: hostTypeValue || `${serverIp}:${portNo}`,
          lastConnected: Date.now(),
        };
        
        await DeviceStorage.saveDevice(device);
        connectToDevice(device);
        setStatus('QR scanned, connected and saved!');
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
      {isAutoConnecting && (
        <Text style={styles.autoConnectingText}>Auto-connecting to devices...</Text>
      )}
      {connectedDevice && (
        <Text style={styles.connectedDevice}>Connected to: {connectedDevice.name}</Text>
      )}
      {hostType && (
        <Text style={styles.hostType}>Host type: {hostType}</Text>
      )}
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
  connectedDevice: {
    marginTop: 8,
    fontSize: 15,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  autoConnectingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#1976d2',
    fontStyle: 'italic',
    textAlign: 'center',
  },
}); 