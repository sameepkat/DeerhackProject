# Device Pairing Setup

## Installation

This implementation requires AsyncStorage for persistent device storage. Install it with:

```bash
npm install @react-native-async-storage/async-storage
```

## Features Implemented

### 1. Device Storage (`services/DeviceStorage.ts`)
- **Persistent storage** of paired devices using AsyncStorage
- **CRUD operations**: Add, update, remove, and retrieve devices
- **Device interface** with id, ip, port, token, hostType, name, and lastConnected timestamp

### 2. Pairing Screen (`app/(tabs)/pair.tsx`)
- **Manual pairing**: Enter IP, port, and token manually
- **QR code scanning**: Scan QR codes to auto-fill connection details
- **Automatic saving**: Devices are automatically saved when successfully paired
- **Validation**: Ensures all required fields are filled before connecting

### 3. Devices Screen (`app/(tabs)/devices.tsx`)
- **Grid display**: Shows paired devices in a 2-column grid
- **Device cards**: Each device shows name, IP:port, and host type
- **Editable names**: Tap "Edit Name" to rename devices
- **Remove devices**: Tap "Remove" to delete devices with confirmation
- **Empty state**: Shows helpful message when no devices are paired
- **Auto-refresh**: Updates when navigating back to the screen

## How It Works

1. **Pairing**: When you connect to a device (manually or via QR), it's automatically saved with a default name (`IP:PORT`)
2. **Display**: The Devices tab shows all paired devices in a grid layout
3. **Management**: You can rename devices or remove them as needed
4. **Persistence**: All devices are stored locally and persist between app sessions

## Usage

1. Go to the **Pair** tab
2. Either:
   - Enter IP, port, and token manually, then tap "Connect"
   - Tap "Scan QR" to scan a QR code with connection details
3. The device will be saved automatically
4. Go to the **Devices** tab to see all paired devices
5. Tap "Edit Name" to rename a device
6. Tap "Remove" to delete a device

## Technical Details

- **Device ID**: Generated from IP and port (`IP:PORT`)
- **Storage**: Uses AsyncStorage with key `'paired_devices'`
- **UI**: Responsive grid layout with cards and modals
- **Navigation**: Uses `useFocusEffect` to refresh when returning to the screen 