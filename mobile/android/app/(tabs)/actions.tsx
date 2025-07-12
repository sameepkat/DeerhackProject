import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Button, TextInput } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useWebSocket } from '@/services/WebSocketContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { PanResponder } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

// Type for file progress
interface FileProgress {
  sent: number;
  total: number;
}

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
  {
    key: 'presentation',
    label: 'Presentation Remote',
    icon: 'chevron.right',
    action: 'presentation',
  },
  {
    key: 'command',
    label: 'Run Command',
    icon: 'chevron.left.forwardslash.chevron.right', // Use a valid icon
    action: 'command',
  },
  {
    key: 'remoteinput',
    label: 'Remote Input',
    icon: 'chevron.left.forwardslash.chevron.right', // Use a valid icon
    action: 'remoteinput',
  },
  {
    key: 'sendfile',
    label: 'Send File',
    icon: 'paperclip',
    action: 'sendfile',
  },
  // Add more features here, using only valid icon names from IconSymbol
] as const;

type FeatureType = typeof features[number];

export default function ActionsScreen() {
  const { send, connected, lastMessage } = useWebSocket();
  const [clipboardValue, setClipboardValue] = useState('');
  const [status, setStatus] = useState('');
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [presentationModalVisible, setPresentationModalVisible] = useState(false);
  const [commandModalVisible, setCommandModalVisible] = useState(false);
  const [volume, setVolume] = useState(50);
  const [commandInput, setCommandInput] = useState('');
  const [commandOutput, setCommandOutput] = useState<string[]>([]);
  const [remoteInputModalVisible, setRemoteInputModalVisible] = useState(false);
  const [sensitivity, setSensitivity] = useState(1);
  const [fileProgress, setFileProgress] = useState<FileProgress | null>(null);
  const [brightness, setBrightness] = useState(50);
  const lastGestureStateRef = React.useRef({ dx: 0, dy: 0 });

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
    } else if (feature.action === 'presentation') {
      setPresentationModalVisible(true);
    } else if (feature.action === 'command') {
      setCommandModalVisible(true);
    } else if (feature.action === 'remoteinput') {
      setRemoteInputModalVisible(true);
    } else if (feature.action === 'sendfile') {
      if (!connected) {
        setStatus('Not connected to server');
        return;
      }
      try {
        const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
        console.log('DocumentPicker result:', res);

        if (res.canceled) {
          setStatus('File selection cancelled');
          return;
        }
        if (!res.assets || res.assets.length === 0) {
          setStatus('No file selected');
          return;
        }

        const asset = res.assets[0];
        const fileId = Math.random().toString(36).substr(2, 8);
        const fileUri = asset.uri;
        const fileName = asset.name;
        const fileSize = asset.size ?? 0;
        const mime = asset.mimeType || 'application/octet-stream';

        if (!fileUri || !fileName || !fileSize) {
          setStatus('Invalid file selection (missing uri, name, or size)');
          console.log('Invalid file selection:', { fileUri, fileName, fileSize });
          return;
        }

        const chunkSize = 64 * 1024; // 64KB (in bytes, but base64 expands data)
        setStatus('Reading file...');
        // Read the whole file as base64
        const base64String = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
        // Each 3 bytes of binary data become 4 base64 chars, so adjust chunking
        const base64ChunkSize = Math.floor(chunkSize / 3) * 4; // chunk base64 string by this many chars
        const totalChunks = Math.ceil(base64String.length / base64ChunkSize);
        send(JSON.stringify({
          type: 'file_start',
          fileId,
          name: fileName,
          size: fileSize,
          mime,
        }));
        let sent = 0;
        for (let i = 0; i < totalChunks; i++) {
          const start = i * base64ChunkSize;
          const end = Math.min(base64String.length, (i + 1) * base64ChunkSize);
          const base64Chunk = base64String.slice(start, end);
          send(JSON.stringify({
            type: 'file_chunk',
            fileId,
            index: i,
            data: base64Chunk,
          }));
          // Estimate bytes sent (base64 is 4/3 the size of binary)
          sent = Math.min(fileSize, Math.floor((end * 3) / 4));
          setFileProgress({ sent, total: fileSize });
          console.log(`Sent chunk ${i + 1}/${totalChunks}`);
        }
        send(JSON.stringify({ type: 'file_end', fileId }));
        console.log('Sent file_end');
        setStatus('File sent!');
        setFileProgress(null);
      } catch (err: any) {
        setStatus('File send failed: ' + (err.message || err.toString()));
        setFileProgress(null);
      }
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
    } else if (action === 'brightness' && typeof value === 'number') {
      send(JSON.stringify({ type: 'media', action: 'brightness', value }));
      setStatus(`Brightness set to ${value}`);
    } else {
      send(JSON.stringify({ type: 'media', action }));
      setStatus(`Media action: ${action}`);
    }
  };

  const handlePresentationAction = (action: string) => {
    if (!connected) {
      setStatus('Not connected to server');
      return;
    }
    send(JSON.stringify({ type: 'presentation', action }));
    setStatus(`Presentation action: ${action}`);
  };

  const handleSendCommand = () => {
    if (!connected || !commandInput.trim()) return;
    send(JSON.stringify({ type: 'command', command: commandInput.trim() }));
    setCommandOutput((prev) => [...prev, `> ${commandInput.trim()}`]);
    setCommandInput('');
  };

  // PanResponder for touchpad
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Reset on new touch
        lastGestureStateRef.current = { dx: 0, dy: 0 };
      },
      onPanResponderMove: (evt, gestureState) => {
        // Calculate the delta since the last move
        const dx = (gestureState.dx - lastGestureStateRef.current.dx) * sensitivity;
        const dy = (gestureState.dy - lastGestureStateRef.current.dy) * sensitivity;

        // Update the ref for the next event
        lastGestureStateRef.current = { dx: gestureState.dx, dy: gestureState.dy };

        if (connected) {
          send(
            JSON.stringify({
              type: 'remote_input',
              dx,
              dy,
            })
          );
        }
      },
      onPanResponderRelease: () => {
        // Reset the gesture state on release
        lastGestureStateRef.current = { dx: 0, dy: 0 };
      },
    })
  ).current;

  // Listen for output from the server (echoed or real)
  React.useEffect(() => {
    if (lastMessage) {
      try {
        const msg = JSON.parse(lastMessage);
        if (msg.type === 'command_output' && typeof msg.output === 'string') {
          setCommandOutput((prev) => [...prev, msg.output]);
        }
      } catch {
        // Not a JSON message, just append
        setCommandOutput((prev) => [...prev, lastMessage]);
      }
    }
  }, [lastMessage]);

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
      {fileProgress && (
        <Text style={styles.status}>
          Sending file: {((fileProgress.sent / fileProgress.total) * 100).toFixed(1)}%
        </Text>
      )}
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
            <Text style={styles.mediaLabel}>Brightness</Text>
            <View style={styles.volumeRow}>
              <TouchableOpacity
                style={[styles.volumeButton, brightness <= 0 && styles.volumeButtonDisabled]}
                onPress={() => {
                  if (brightness > 0) {
                    const newBrightness = Math.max(0, brightness - 5);
                    setBrightness(newBrightness);
                    handleMediaAction('brightness', newBrightness);
                  }
                }}
                disabled={brightness <= 0}
              >
                <Text style={styles.volumeButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.volumeValue}>{brightness}</Text>
              <TouchableOpacity
                style={[styles.volumeButton, brightness >= 100 && styles.volumeButtonDisabled]}
                onPress={() => {
                  if (brightness < 100) {
                    const newBrightness = Math.min(100, brightness + 5);
                    setBrightness(newBrightness);
                    handleMediaAction('brightness', newBrightness);
                  }
                }}
                disabled={brightness >= 100}
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
      {/* Presentation Remote Modal */}
      <Modal visible={presentationModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.presentationModal}>
            <Text style={styles.mediaTitle}>Presentation Remote</Text>
            <View style={styles.presentationRow}>
              <TouchableOpacity style={styles.presentationButton} onPress={() => handlePresentationAction('previous')}>
                <Text style={styles.presentationButtonText}>⬅️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.presentationButton} onPress={() => handlePresentationAction('next')}>
                <Text style={styles.presentationButtonText}>➡️</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setPresentationModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Run Command Modal */}
      <Modal visible={commandModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.commandModal}>
            <Text style={styles.mediaTitle}>Terminal</Text>
            <View style={styles.terminalOutput}>
              <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
                {commandOutput.map((line, idx) => (
                  <Text key={idx} style={styles.terminalText}>{line}</Text>
                ))}
              </ScrollView>
            </View>
            <View style={styles.terminalInputRow}>
              <Text style={styles.terminalPrompt}>$</Text>
              <View style={{ flex: 1 }}>
                <ScrollView horizontal>
                  <Text
                    style={styles.terminalInput}
                    selectable={false}
                  >
                    {commandInput}
                  </Text>
                </ScrollView>
                <View style={styles.terminalInputUnderline} />
              </View>
            </View>
            <View style={styles.terminalInputActions}>
              <TouchableOpacity style={styles.terminalSendButton} onPress={handleSendCommand}>
                <Text style={styles.terminalSendButtonText}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setCommandModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.terminalInputFieldRow}>
              <TextInput
                style={styles.terminalInputField}
                value={commandInput}
                onChangeText={setCommandInput}
                placeholder="Enter command..."
                placeholderTextColor="#888"
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleSendCommand}
                blurOnSubmit={false}
              />
            </View>
          </View>
        </View>
      </Modal>
      {/* Remote Input Modal */}
      <Modal visible={remoteInputModalVisible} animationType="slide" transparent={true}>
        <View style={styles.remoteInputOverlay}>
          <View style={styles.remoteInputModal}>
            <Text style={styles.mediaTitle}>Remote Input</Text>
            <View
              style={styles.touchpad}
              {...panResponder.panHandlers}
            >
              <Text style={styles.touchpadText}>Touchpad Area</Text>
            </View>
            <Text style={styles.mediaLabel}>Sensitivity: {sensitivity.toFixed(2)}</Text>
            <View style={styles.sensitivityRow}>
              <TouchableOpacity
                style={styles.sensitivityButton}
                onPress={() => setSensitivity(Math.max(0.1, sensitivity - 0.1))}
              >
                <Text style={styles.sensitivityButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sensitivityButton}
                onPress={() => setSensitivity(Math.min(5, sensitivity + 0.1))}
              >
                <Text style={styles.sensitivityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setRemoteInputModalVisible(false)}>
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
  presentationModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 320,
    elevation: 4,
  },
  presentationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  presentationButton: {
    backgroundColor: '#1976d2',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presentationButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  commandModal: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 24,
    alignItems: 'stretch',
    width: 340,
    elevation: 4,
  },
  terminalOutput: {
    backgroundColor: '#111',
    borderRadius: 8,
    minHeight: 120,
    maxHeight: 180,
    padding: 10,
    marginBottom: 12,
  },
  terminalText: {
    color: '#b9f18d',
    fontFamily: 'monospace',
    fontSize: 15,
    marginBottom: 2,
  },
  terminalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  terminalPrompt: {
    color: '#b9f18d',
    fontFamily: 'monospace',
    fontSize: 18,
    marginRight: 6,
  },
  terminalInput: {
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 16,
    minHeight: 20,
  },
  terminalInputUnderline: {
    height: 1,
    backgroundColor: '#b9f18d',
    marginTop: 2,
  },
  terminalInputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  terminalSendButton: {
    backgroundColor: '#1976d2',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  terminalSendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  terminalInputFieldRow: {
    marginTop: 8,
  },
  terminalInputField: {
    backgroundColor: '#222',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 16,
    borderRadius: 8,
    padding: 10,
  },
  remoteInputOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteInputModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 340,
    elevation: 4,
  },
  touchpad: {
    backgroundColor: '#222',
    borderRadius: 16,
    width: 280,
    height: 220,
    marginVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1976d2',
  },
  touchpadText: {
    color: '#b9f18d',
    fontFamily: 'monospace',
    fontSize: 16,
  },
  sensitivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  sensitivityButton: {
    backgroundColor: '#1976d2',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensitivityButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
