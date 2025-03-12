import React, { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, Image, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

export default function ChatsScreen() {
  const navigation = useNavigation();

  // Simulated chat list
  const [chats, setChats] = useState([
    { id: '1', name: 'Alice', lastMessage: 'Hey! How are you?', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
    { id: '2', name: 'Bob', lastMessage: 'Let’s catch up soon!', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { id: '3', name: 'Charlie', lastMessage: 'See you tomorrow.', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
  ]);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search chats..."
        placeholderTextColor="gray"
      />

      {/* Chat List */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.chatItem} 
            onPress={() => navigation.navigate('ChatRoom', { userName: item.name })}
          >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.chatInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* New Chat Button */}
      <TouchableOpacity 
        style={styles.newChatButton} 
        onPress={() => navigation.navigate('NewChat')}
      >
        <FontAwesome name="pencil" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', padding: 10 },
  searchBar: { backgroundColor: '#222', color: 'white', padding: 10, borderRadius: 8, marginBottom: 10 },
  chatItem: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  chatInfo: { justifyContent: 'center' },
  name: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  lastMessage: { color: 'gray', fontSize: 14 },
  newChatButton: { 
    position: 'absolute', bottom: 20, right: 20, backgroundColor: 'gray', padding: 12, borderRadius: 30 
  }
});
