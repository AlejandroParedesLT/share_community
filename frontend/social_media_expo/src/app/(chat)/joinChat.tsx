// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   FlatList, 
//   TouchableOpacity, 
//   StyleSheet, 
//   ActivityIndicator,
//   Alert
// } from 'react-native';
// import { router } from 'expo-router';
// import { FontAwesome } from '@expo/vector-icons';
// import { useAuth } from '../../providers/DjangoAuthProvider';

// type Chat = {
//   id: number;
//   name: string;
//   participants: Array<{
//     id: number;
//     username: string;
//   }>;
//   is_group: boolean;
//   last_message?: {
//     content: string;
//     created_at: string;
//   };
// };

// export default function JoinChatScreen() {
//   const [availableChats, setAvailableChats] = useState<Chat[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [joining, setJoining] = useState<number | null>(null);
//   const { accessToken, user } = useAuth();
  
//   // Current user ID from auth provider
//   const currentUserId = user?.data?.id;

//   useEffect(() => {
//     fetchAvailableChats();
//   }, []);

//   const fetchAvailableChats = async () => {
//     if (!accessToken) {
//       Alert.alert('Error', 'You must be logged in');
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/chats/`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch chats');
//       }
      
//       const data = await response.json();
//       console.log("Fetched chats:", JSON.stringify(data));
//       // Filter out chats where user is already a participant
//       const filteredChats = data.filter(chat => 
//         !chat.participants_details.some(participant => participant.id === currentUserId)
//       );
//       setAvailableChats(filteredChats);
//     } catch (error) {
//       console.error('Error fetching available chats:', error);
//       Alert.alert('Error', 'Failed to load available chats');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const joinChat = async (chatId: number) => {
//     if (!accessToken || !currentUserId) {
//       Alert.alert('Error', 'You must be logged in');
//       return;
//     }

//     try {
//       setJoining(chatId);
      
//       // First, get current chat data
//       const getResponse = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/chats/${chatId}/`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });
      
//       if (!getResponse.ok) {
//         throw new Error('Failed to get chat details');
//       }
      
//       const chatData = await getResponse.ok ? await getResponse.json() : null;
      
//       if (!chatData) {
//         throw new Error('Invalid chat data');
//       }
      
//       // Add current user to participants
//       const updatedParticipants = [
//         ...chatData.participants_details.map(p => p.id),
//         currentUserId
//       ];
      
//       // Update chat with PUT request
//       const putResponse = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/chats/${chatId}/`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify({
//           ...chatData,
//           participants: updatedParticipants
//         }),
//       });
      
//       if (!putResponse.ok) {
//         throw new Error('Failed to join chat');
//       }
      
//       // Remove joined chat from available list
//       setAvailableChats(availableChats.filter(chat => chat.id !== chatId));
      
//       Alert.alert(
//         'Success', 
//         'You have joined the chat successfully!',
//         [
//           { 
//             text: 'Go to Chat', 
//             onPress: () => {
//               const participantNames = chatData.participants
//                 .map(p => p.username)
//                 .join(', ');
                
//               router.push({
//                 pathname: `/(chat)/${chatId}`,
//                 params: { userName: participantNames }
//               });
//             }
//           },
//           {
//             text: 'Stay Here',
//             style: 'cancel'
//           }
//         ]
//       );
//     } catch (error) {
//       console.error('Error joining chat:', error);
//       Alert.alert('Error', 'Failed to join chat');
//     } finally {
//       setJoining(null);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton} 
//           onPress={() => router.back()}
//         >
//           <FontAwesome name="arrow-left" size={24} color="white" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Join Group Chats</Text>
//       </View>
      
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="white" />
//           <Text style={styles.loadingText}>Loading available chats...</Text>
//         </View>
//       ) : availableChats.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <FontAwesome name="users" size={48} color="gray" />
//           <Text style={styles.emptyText}>You belong to all group chats!</Text>
//           <Text style={styles.emptySubtext}>All chats have been joined or no groups exist yet</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={availableChats}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={({ item }) => {
//             const participantNames = item.participant_details
//               .map(p => p.username)
//               .join(', ');
              
//             return (
//               <View style={styles.chatItem}>
//                 <View style={styles.chatInfo}>
//                   <Text style={styles.chatName}>
//                     {item.name || `Group with ${participantNames}`}
//                   </Text>
//                   <Text style={styles.participantText}>
//                     {participantNames}
//                   </Text>
//                   <Text style={styles.messageCount}>
//                     {item.last_message ? '1 message' : 'No messages yet'}
//                   </Text>
//                 </View>
//                 <TouchableOpacity 
//                   style={styles.joinButton}
//                   onPress={() => joinChat(item.id)}
//                   disabled={joining === item.id}
//                 >
//                   {joining === item.id ? (
//                     <ActivityIndicator size="small" color="white" />
//                   ) : (
//                     <Text style={styles.joinButtonText}>Join</Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             );
//           }}
//         />
//       )}
      
//       <TouchableOpacity 
//         style={styles.refreshButton} 
//         onPress={fetchAvailableChats}
//       >
//         <FontAwesome name="refresh" size={24} color="white" />
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: 'black', 
//     padding: 10 
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//     paddingVertical: 10
//   },
//   backButton: {
//     marginRight: 20
//   },
//   headerTitle: {
//     color: 'white',
//     fontSize: 20,
//     fontWeight: 'bold'
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   loadingText: {
//     color: 'white',
//     marginTop: 10
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   emptyText: {
//     color: 'white',
//     fontSize: 18,
//     marginTop: 16
//   },
//   emptySubtext: {
//     color: 'gray',
//     fontSize: 14,
//     marginTop: 8,
//     textAlign: 'center'
//   },
//   chatItem: {
//     flexDirection: 'row',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#333',
//     justifyContent: 'space-between',
//     alignItems: 'center'
//   },
//   chatInfo: {
//     flex: 1
//   },
//   chatName: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold'
//   },
//   participantText: {
//     color: 'lightgray',
//     fontSize: 14,
//     marginTop: 4
//   },
//   messageCount: {
//     color: 'gray',
//     fontSize: 12,
//     marginTop: 4
//   },
//   joinButton: {
//     backgroundColor: 'gray',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     justifyContent: 'center',
//     minWidth: 70,
//     alignItems: 'center'
//   },
//   joinButtonText: {
//     color: 'white',
//     fontWeight: 'bold'
//   },
//   refreshButton: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//     backgroundColor: 'gray',
//     padding: 12,
//     borderRadius: 30
//   }
// });


import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../providers/DjangoAuthProvider';

type Chat = {
  id: number;
  name: string;
  participants: Array<{
    id: number;
    username: string;
  }>;
  is_group: boolean;
  last_message?: {
    content: string;
    created_at: string;
  };
};

export default function JoinChatScreen() {
  const [availableChats, setAvailableChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<number | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const { accessToken, user } = useAuth();
  
  // Current user ID from auth provider
  const currentUserId = user?.data?.id;

  useEffect(() => {
    fetchAvailableChats();
  }, []);

  const fetchAvailableChats = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/chats/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      
      const data = await response.json();
      console.log("Fetched chats:", JSON.stringify(data));
      // Filter out chats where user is already a participant
      const filteredChats = data.filter(chat => 
        !chat.participants_details.some(participant => participant.id === currentUserId)
      );
      setAvailableChats(filteredChats);
    } catch (error) {
      console.error('Error fetching available chats:', error);
      Alert.alert('Error', 'Failed to load available chats');
    } finally {
      setLoading(false);
    }
  };

  const joinChat = async (chatId: number) => {
    if (!accessToken || !currentUserId) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    try {
      setJoining(chatId);
      
      // First, get current chat data
      const getResponse = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/chats/${chatId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (!getResponse.ok) {
        throw new Error('Failed to get chat details');
      }
      
      const chatData = await getResponse.ok ? await getResponse.json() : null;
      
      if (!chatData) {
        throw new Error('Invalid chat data');
      }
      console.log("Chat data:", JSON.stringify(chatData));
      // Add current user to participants
      const updatedParticipants = [
        ...chatData.participants_details.map(p => p.id),
        currentUserId
      ];
      
      // Update chat with PUT request
      const putResponse = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/chats/${chatId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...chatData,
          participants: updatedParticipants
        }),
      });
      
      if (!putResponse.ok) {
        throw new Error('Failed to join chat');
      }
      
      // Remove joined chat from available list
      setAvailableChats(availableChats.filter(chat => chat.id !== chatId));
      
      Alert.alert(
        'Success', 
        'You have joined the chat successfully!',
        [
          { 
            text: 'Go to Chat', 
            onPress: () => {
              const participantNames = chatData.participants_details
                .map(p => p.username)
                .join(', ');
                
              router.push({
                pathname: `/(chat)/${chatId}`,
                params: { userName: participantNames }
              });
            }
          },
          {
            text: 'Stay Here',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error joining chat:', error);
      Alert.alert('Error', 'Failed to join chat');
    } finally {
      setJoining(null);
    }
  };

  const createNewGroup = async () => {
    if (!accessToken || !currentUserId) {
      Alert.alert('Error', 'You must be logged in to create a group');
      return;
    }

    try {
      setCreatingGroup(true);
      
      // Make a POST request to create a new group with just the current user
      const response = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/chats/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          participants: [currentUserId]
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create new group');
      }
      
      const newChat = await response.json();
      
      Alert.alert(
        'Success', 
        'New group created successfully!',
        [
          { 
            text: 'Go to Group', 
            onPress: () => {
              router.push({
                pathname: `/(chat)/${newChat.id}`,
                params: { userName: user?.data?.username || 'New Group' }
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating new group:', error);
      Alert.alert('Error', 'Failed to create new group chat');
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join Group Chats</Text>
      </View>

      {/* Create New Group Button */}
      <TouchableOpacity 
        style={styles.createGroupButton}
        onPress={createNewGroup}
        disabled={creatingGroup}
      >
        {creatingGroup ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <FontAwesome name="plus" size={18} color="white" style={styles.createIcon} />
            <Text style={styles.createGroupText}>Create New Group</Text>
          </>
        )}
      </TouchableOpacity>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading available chats...</Text>
        </View>
      ) : availableChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="users" size={48} color="gray" />
          <Text style={styles.emptyText}>You belong to all group chats!</Text>
          <Text style={styles.emptySubtext}>All chats have been joined or no groups exist yet</Text>
        </View>
      ) : (
        <FlatList
          data={availableChats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const participantNames = item.participants_details
              .map(p => p.username)
              .join(', ');
              
            return (
              <View style={styles.chatItem}>
                <View style={styles.chatInfo}>
                  <Text style={styles.chatName}>
                    {item.name || `Group with ${participantNames}`}
                  </Text>
                  <Text style={styles.participantText}>
                    {participantNames}
                  </Text>
                  <Text style={styles.messageCount}>
                    {item.last_message ? '1 message' : 'No messages yet'}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.joinButton}
                  onPress={() => joinChat(item.id)}
                  disabled={joining === item.id}
                >
                  {joining === item.id ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.joinButtonText}>Join</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
      
      <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={fetchAvailableChats}
      >
        <FontAwesome name="refresh" size={24} color="white" />
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
    fontWeight: 'bold'
  },
  createGroupButton: {
    backgroundColor: '#444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  createIcon: {
    marginRight: 8
  },
  createGroupText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: 'white',
    marginTop: 10
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    marginTop: 16
  },
  emptySubtext: {
    color: 'gray',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center'
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chatInfo: {
    flex: 1
  },
  chatName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  participantText: {
    color: 'lightgray',
    fontSize: 14,
    marginTop: 4
  },
  messageCount: {
    color: 'gray',
    fontSize: 12,
    marginTop: 4
  },
  joinButton: {
    backgroundColor: 'gray',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 70,
    alignItems: 'center'
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  refreshButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'gray',
    padding: 12,
    borderRadius: 30
  }
});