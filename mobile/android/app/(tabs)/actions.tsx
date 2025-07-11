import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Button } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useWebSocket } from '@/services/WebSocketContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Slider from '@react-native-community/slider';

const features = [
  {
    key: 'clipboard',
    label: 'Clipboard Sync',
    icon: 'chevron.left.forwardslash.chevron.right',
    action: 'clipboard',
  },
  {
    key: 'media',
    label: 'Media Control',
    icon: 'paperplane.fill',
    action: 'media',
  },
  // Add more features here, using only valid icon names from IconSymbol
] as const;

type FeatureType = typeof features[number];

export default function ActionsScreen() {
  const { send, connected } = useWebSocket();
  const [clipboardValue, setClipboardValue] = useState('');
  const [status, setStatus] = useState('');
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [volume, setVolume] = useState(50);

  const handleFeaturePress = async (feature: FeatureType) => {
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
      setMediaModalVisible(true);
    }
    // Add more feature actions here
  };

  const handleMediaAction = (action: string, value?: number) => {
    if (!connected) {
      setStatus('Not connected to server');
      return;
    }
    if (action === 'volume' && typeof value === 'number') {
      send(JSON.stringify({ type: 'media', action: 'volume', value }));
      setStatus(`Volume set to ${value}`);
    } else {
      send(JSON.stringify({ type: 'media', action }));
      setStatus(`Media action: ${action}`);
    }
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
      {/* Media Control Modal */}
      <Modal visible={mediaModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.mediaModal}>
            <Text style={styles.mediaTitle}>Media Remote</Text>
            <View style={styles.mediaRow}>
              <TouchableOpacity style={styles.mediaButton} onPress={() => handleMediaAction('previous')}>
                <Text style={styles.mediaButtonText}>⏮️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaButton} onPress={() => handleMediaAction('playpause')}>
                <Text style={styles.mediaButtonText}>⏯️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaButton} onPress={() => handleMediaAction('next')}>
                <Text style={styles.mediaButtonText}>⏭️</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mediaRow}>
              <TouchableOpacity style={styles.mediaButton} onPress={() => handleMediaAction('stop')}>
                <Text style={styles.mediaButtonText}>⏹️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.mediaLabel}>Volume</Text>
            <View style={styles.volumeRow}>
              <TouchableOpacity
                style={[styles.volumeButton, volume <= 0 && styles.volumeButtonDisabled]}
                onPress={() => {
                  if (volume > 0) {
                    const newVol = Math.max(0, volume - 5);
                    setVolume(newVol);
                    handleMediaAction('volume', newVol);
                  }
                }}
                disabled={volume <= 0}
              >
                <Text style={styles.volumeButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.volumeValue}>{volume}</Text>
              <TouchableOpacity
                style={[styles.volumeButton, volume >= 100 && styles.volumeButtonDisabled]}
                onPress={() => {
                  if (volume < 100) {
                    const newVol = Math.min(100, volume + 5);
                    setVolume(newVol);
                    handleMediaAction('volume', newVol);
                  }
                }}
                disabled={volume >= 100}
              >
                <Text style={styles.volumeButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setMediaModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 320,
    elevation: 4,
  },
  mediaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  mediaLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  slider: {
    width: 200,
    height: 40,
    marginTop: 8,
  },
  mediaValue: {
    fontSize: 16,
    marginBottom: 12,
  },
  mediaButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 32,
    padding: 18,
    marginHorizontal: 12,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  mediaButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  volumeButton: {
    backgroundColor: '#1976d2',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeButtonDisabled: {
    backgroundColor: '#bdbdbd',
  },
  volumeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  volumeValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 8,
    minWidth: 40,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 18,
    backgroundColor: '#f44336',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
