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
      <TouchableOpacity 
        style={[styles.deviceCard, isConnected && styles.connectedDeviceCard]}
        onPress={() => handleDevicePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.deviceHeader}>
          <IconSymbol name="desktopcomputer" size={24} color="#1976d2" />
          <View style={styles.deviceNameContainer}>
            <Text style={styles.deviceName}>{item.name}</Text>
            {isConnected && (
              <Text style={styles.connectedIndicator}>(paired)</Text>
            )}
          </View>
        </View>
        <Text style={styles.deviceDetails}>{item.ip}:{item.port}</Text>
        <View style={styles.deviceActions}>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => handleEditName(item)}
          >
            <Text style={styles.editButtonText}>Edit Name</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.removeButton} 
            onPress={() => handleRemoveDevice(item)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

      return (
      <View style={styles.container}>
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
          numColumns={2}
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
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  deviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
    minWidth: (Dimensions.get('window').width - 60) / 2,
  },
  connectedDeviceCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
    borderWidth: 2,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  deviceNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedIndicator: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  deviceDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  hostType: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 12,
  },
  deviceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    marginRight: 4,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    marginLeft: 4,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
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