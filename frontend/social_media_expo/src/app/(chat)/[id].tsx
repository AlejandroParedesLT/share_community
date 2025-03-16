import React, { useState } from 'react';
import { View, FlatList, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function ChatRoom() {
  const { id, userName } = useLocalSearchParams();

  const [messages, setMessages] = useState([
    { id: '1', text: 'Hey there!', sender: userName || 'User' },
    { id: '2', text: 'Hello! How are you?', sender: 'Me' },
  ]);

  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim() === '') return;
    const newMessage = { id: Date.now().toString(), text: inputText, sender: 'Me' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.header}>{userName}</Text>
      </View>
      
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.message, item.sender === 'Me' ? styles.myMessage : styles.otherMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="gray"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <FontAwesome name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'black', 
    padding: 10 
  },
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10 
  },
  backButton: { 
    padding: 8 
  },
  header: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    flex: 1 
  },
  message: { 
    padding: 10, 
    marginVertical: 5, 
    borderRadius: 8, 
    maxWidth: '75%' 
  },
  myMessage: { 
    alignSelf: 'flex-end', 
    backgroundColor: 'gray' 
  },
  otherMessage: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#222' 
  },
  messageText: { 
    color: 'white', 
    fontSize: 16 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderTopColor: '#333', 
    padding: 10 
  },
  input: { 
    flex: 1, 
    backgroundColor: '#222', 
    color: 'white', 
    padding: 10, 
    borderRadius: 8, 
    marginRight: 10 
  },
  sendButton: { 
    backgroundColor: 'gray', 
    padding: 10, 
    borderRadius: 8 
  },
});