import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function DevicesScreen() {
  return (
    <View style={styles.container}>
      <IconSymbol name="desktopcomputer" size={64} color="#888" style={styles.logo} />
      <Text style={styles.text}>Devices Screen (List and select devices here)</Text>
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
  logo: {
    marginBottom: 24,
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
  },
}); 