import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Modal, Alert, TouchableOpacity } from 'react-native';
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
    <View style={styles.outerContainer}>
      <View style={styles.card}>
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
        <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
          <Text style={styles.connectButtonText}>Connect</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.qrButton} onPress={handleScanQR}>
          <Text style={styles.qrButtonText}>Scan QR</Text>
        </TouchableOpacity>
        <Text style={[styles.status, connected ? styles.statusConnected : status.toLowerCase().includes('error') || status.toLowerCase().includes('fail') ? styles.statusError : null]} numberOfLines={1} ellipsizeMode="tail">
          Status: {connected ? 'Connected' : status}
        </Text>
        {isAutoConnecting && (
          <Text style={styles.autoConnectingText}>Auto-connecting to devices...</Text>
        )}
        {connectedDevice && (
          <Text style={styles.connectedDevice} numberOfLines={1} ellipsizeMode="tail">Connected to: {connectedDevice.name}</Text>
        )}
        {hostType && (
          <Text style={styles.hostType} numberOfLines={1} ellipsizeMode="tail">Host type: {hostType}</Text>
        )}
      </View>
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
          <View style={styles.scannerCancelContainer}>
            <TouchableOpacity style={styles.qrCancelButton} onPress={() => setScannerVisible(false)}>
              <Text style={styles.qrButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafbfc',
    padding: 16,
  },
  card: {
    width: '96%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: '#f7fafd',
  },
  connectButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  qrButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  qrButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  status: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#888',
  },
  statusConnected: {
    color: '#1976d2',
  },
  statusError: {
    color: '#f44336',
  },
  autoConnectingText: {
    marginTop: 6,
    fontSize: 14,
    color: '#1976d2',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  connectedDevice: {
    marginTop: 6,
    fontSize: 15,
    color: '#1976d2',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hostType: {
    marginTop: 6,
    fontSize: 15,
    color: '#1976d2',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
  },
  scannerCancelContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  qrCancelButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    marginBottom: 0,
  },
}); 