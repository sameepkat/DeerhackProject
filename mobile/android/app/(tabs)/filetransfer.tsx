import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FileTransferScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>File Transfer Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
  },
}); 