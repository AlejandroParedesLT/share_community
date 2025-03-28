import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, Image, TextInput, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../providers/DjangoAuthProvider';

export default function ChatsScreen() {
  // Init change here

  const [chats, setChats] = useState([]);
  const { accessToken } = useAuth();  // Get the access token
  
  useEffect(() => {
    // Fetch past conversations from the backend
    const fetchChats = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/chats/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`, // Replace with actual token
          },
        });
        
        const data = await response.json();
        //console.log('Log response from outside',JSON.stringify(data));
        setChats(data);
        console.log("Fetched chats:", JSON.stringify(chats)); // ✅ Log data correctly
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchChats();
  }, []);

// End of change here

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search chats..."
        placeholderTextColor="gray"
      />

      {/* Chat List */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const participantNames = Array.isArray(item.participants)
            ? item.participants.map(p => p.username).join(', ')
            : "Unknown";

          console.log("Participant Names:", participantNames); // ✅ Debugging step

          return (
            <TouchableOpacity 
              style={styles.chatItem} 
              onPress={() => router.push({
                pathname: `/(chat)/${item.id}`,
                params: { userName: participantNames }
              })}
            >
              <Image 
                source={{ uri: item.avatar || 'https://cdn-icons-png.flaticon.com/512/166/166258.png' }} 
                style={styles.avatar} 
              />
              <View style={styles.chatInfo}>
                <Text style={styles.name}>{String(participantNames)}</Text>  {/* ✅ Ensures it's always a string */}
                <Text style={styles.lastMessage}>{String(item.last_message?.content || "No messages yet")}</Text>  {/* ✅ Ensures content is a string */}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* New Chat Button */}
      <TouchableOpacity 
        style={styles.newChatButton} 
        onPress={() => console.log('New chat')}
      >
        <FontAwesome name="pencil" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'black', 
    padding: 10 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10
  },
  backButton: {
    marginRight: 20
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Brush Script MT'
  },
  searchBar: { 
    backgroundColor: '#222', 
    color: 'white', 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 10 
  },
  chatItem: { 
    flexDirection: 'row', 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#333' 
  },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    marginRight: 10 
  },
  chatInfo: { 
    justifyContent: 'center' 
  },
  name: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  lastMessage: { 
    color: 'gray', 
    fontSize: 14 
  },
  newChatButton: { 
    position: 'absolute', 
    bottom: 20, 
    right: 20, 
    backgroundColor: 'gray', 
    padding: 12, 
    borderRadius: 30 
  }
});