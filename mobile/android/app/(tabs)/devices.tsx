import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert,
  Dimensions 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { DeviceStorage, Device } from '@/services/DeviceStorage';
import { useWebSocket } from '@/services/WebSocketContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function DevicesScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [editName, setEditName] = useState('');
  const { connectToDevice, connectedDevice, isAutoConnecting } = useWebSocket();

  useFocusEffect(
    React.useCallback(() => {
      loadDevices();
    }, [])
  );

  useEffect(() => {
    // Reload devices to reflect the latest status (e.g., name update after connection)
    loadDevices();
  }, [connectedDevice]);

  const loadDevices = async () => {
    const loadedDevices = await DeviceStorage.getAllDevices();
    setDevices(loadedDevices);
  };

  const handleEditName = (device: Device) => {
    setEditingDevice(device);
    setEditName(device.name);
    setEditModalVisible(true);
  };

  const handleSaveName = async () => {
    if (editingDevice && editName.trim()) {
      await DeviceStorage.updateDeviceName(editingDevice.id, editName.trim());
      await loadDevices(); // Reload devices
      setEditModalVisible(false);
      setEditingDevice(null);
      setEditName('');
    }
  };

  const handleRemoveDevice = async (device: Device) => {
    Alert.alert(
      'Remove Device',
      `Are you sure you want to remove "${device.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await DeviceStorage.removeDevice(device.id);
            await loadDevices();
          },
        },
      ]
    );
  };

  const handleDevicePress = (device: Device) => {
    connectToDevice(device);
  };

  const renderDeviceItem = ({ item }: { item: Device }) => {
    const isConnected = connectedDevice?.id === item.id;
    return (
      <View style={[styles.deviceCard, isConnected && styles.connectedDeviceCard]}>
        <View style={styles.deviceRow}>
          <IconSymbol name="desktopcomputer" size={28} color="#1976d2" />
          <View style={styles.deviceInfo}>
            <View style={styles.deviceNameRow}>
              <Text style={styles.deviceName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
              {isConnected && (
                <View style={styles.pairedBadge}><Text style={styles.pairedBadgeText}>Paired</Text></View>
              )}
            </View>
            <Text style={styles.deviceDetails} numberOfLines={1} ellipsizeMode="tail">{item.ip}:{item.port}</Text>
          </View>
          <View style={styles.deviceActionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleEditName(item)}>
              <MaterialIcons name="edit" size={22} color="#1976d2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleRemoveDevice(item)}>
              <MaterialIcons name="delete" size={22} color="#f44336" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

      return (
      <View style={styles.container}>
        <IconSymbol name="desktopcomputer" size={64} color="#888" style={styles.logo} />
        <Text style={styles.title}>Paired Devices</Text>
        {isAutoConnecting && (
          <Text style={styles.autoConnectingText}>Auto-connecting to devices...</Text>
        )}
        {devices.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="desktopcomputer" size={64} color="#888" style={styles.logo} />
          <Text style={styles.emptyText}>No devices paired yet</Text>
          <Text style={styles.emptySubtext}>Pair a device in the Pair tab to see it here</Text>
        </View>
      ) : (
        <FlatList
          data={devices}
          renderItem={renderDeviceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.deviceList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Device Name</Text>
            <TextInput
              style={styles.nameInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter device name"
              autoFocus={true}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setEditModalVisible(false);
                  setEditingDevice(null);
                  setEditName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveName}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  logo: {
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  deviceList: {
    paddingBottom: 20,
    width: '100%',
  },
  deviceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    alignSelf: 'center',
    width: '92%',
    minWidth: 0,
    minHeight: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  connectedDeviceCard: {
    borderColor: '#1976d2',
    borderWidth: 2,
    backgroundColor: '#e3f2fd',
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    minWidth: 0,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    maxWidth: 170,
  },
  deviceDetails: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
    maxWidth: 170,
  },
  pairedBadge: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 8,
    alignSelf: 'center',
  },
  pairedBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  deviceActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    backgroundColor: 'transparent',
    padding: 4,
    marginLeft: 2,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#666',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  autoConnectingText: {
    textAlign: 'center',
    color: '#1976d2',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
  },
}); 