import { Stack } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function ChatLayout() {
  return (
    <View style={styles.container}>
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: 'black' },
        animation: 'slide_from_right'
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="[id]" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});