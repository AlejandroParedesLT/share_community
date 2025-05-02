// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { View, FlatList, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
// import { useLocalSearchParams, router } from 'expo-router';
// import { FontAwesome } from '@expo/vector-icons';
// import { useAuth } from '../../providers/DjangoAuthProvider';

// // Improved Message Type with optional chaining
// type Message = {
//   id: number;
//   chat: number;
//   sender: {
//     id: number;
//     username: string;
//   };
//   content: string;
//   created_at: string;
//   is_read: boolean;
// };

// export default function ChatRoom() {
//   const { id, userName } = useLocalSearchParams();
//   const { accessToken, user } = useAuth();

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputText, setInputText] = useState('');
//   const [socket, setSocket] = useState<WebSocket | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const flatListRef = useRef<FlatList>(null);
//   console.log('First show the user', JSON.stringify(user))

//   // Safely get user ID
//   const currentUserId = user?.data.id ?? null;
//   const currentUsername = user?.data.username ?? 'Unknown User';

//   // Memoized fetch messages function
//   const fetchMessages = useCallback(async () => {
//     if (!accessToken) {
//       Alert.alert('Authentication Error', 'No access token available');
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const response = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/chats/${id}/messages/`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch messages');
//       }

//       const data: Message[] = await response.json();
//       setMessages(data);
//       //flatListRef.current?.scrollToEnd({ animated: true });
//     } catch (error) {
//       console.error('Error fetching messages:', error);
//       Alert.alert('Error', 'Could not load messages');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [id, accessToken]);

//   // Establish WebSocket connection
//   useEffect(() => {
//     // Guard against missing authentication
//     if (!accessToken || !currentUserId) {
//       console.error('Missing authentication details');
//       return;
//     }

//     // Create WebSocket
//     const ws = new WebSocket(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/ws/chat/${id}/`);

//     ws.onopen = () => {
//       console.log("WebSocket Connected, Sending Authentication...");
//       ws.send(JSON.stringify({ 
//         type: "authentication", 
//         token: accessToken 
//       }));
//     };

//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);

//         // Validate message structure
//         if (data.type === "error") {
//           console.error("WebSocket Error:", data.message);
//           return;
//         }

//         // Ensure sender is an object
//         const normalizedMessage = {
//           ...data,
//           sender: typeof data.sender === 'number' 
//             ? { id: data.sender, username: 'Unknown' }
//             : data.sender
//         };
//         console.log("New WebSocket Message:", normalizedMessage);
        
//         setMessages(prevMessages => {
//           // Prevent duplicate messages
//           console.log("prevMessages Message:", prevMessages);
//           const isDuplicate = prevMessages.some(msg => msg.id === normalizedMessage.id);
//           if (isDuplicate) return prevMessages;

//           return [...prevMessages, normalizedMessage];
//         });

//         // Auto-scroll to bottom
//         flatListRef.current?.scrollToEnd({ animated: true });
//       } catch (error) {
//         console.error('WebSocket message parsing error:', error);
//       }
//     };

//     ws.onerror = (error) => {
//       console.error('WebSocket Error:', error);
//       Alert.alert('Connection Error', 'Could not establish WebSocket connection');
//     };

//     setSocket(ws);

//     // Fetch initial messages
//     fetchMessages();

//     // Cleanup function
//     return () => {
//       ws.close();
//       setSocket(null);
//     };
//   }, [id, accessToken, currentUserId, fetchMessages]);

//   // Scroll to the end when messages are fetched or updated
//   useEffect(() => {
//     if (messages.length > 0 && !isLoading) {
//       flatListRef.current?.scrollToEnd({ animated: true });
//     }
//   }, [messages, isLoading]);

//   const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
//     if (!isLoading) {
//       flatListRef.current?.scrollToEnd({ animated: true });
//     }
//   };

//   // Send message handler with robust checks
//   const sendMessage = useCallback(() => {
//     if (!inputText.trim()) return;
//     if (!socket) {
//       Alert.alert('Connection Error', 'WebSocket is not connected');
//       return;
//     }
//     if (!currentUserId) {
//       Alert.alert('Authentication Error', 'User not authenticated');
//       return;
//     }

//     const newMessage: Message = {
//       id: Date.now(), // Temporary ID
//       chat: Number(id),
//       sender: {
//         id: currentUserId,
//         username: currentUsername
//       },
//       content: inputText,
//       created_at: new Date().toISOString(),
//       is_read: false
//     };

//     try {
//       socket.send(JSON.stringify({
//         type: 'chat_message',
//         ...newMessage
//       }));
      
//       console.log('New messages',newMessage)
//       // Optimistically update messages
//       setMessages(prevMessages => [...prevMessages]); //newMessage
//       setInputText('');
//     } catch (error) {
//       console.error('Message send error:', error);
//       Alert.alert('Send Error', 'Could not send message');
//     }
//   }, [inputText, socket, id, currentUserId, currentUsername]);

//   // Render loading state if necessary
//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading messages...</Text>
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView 
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
//       style={styles.container}
//     >
//       {/* Header */}
//       <View style={styles.headerContainer}>
//         <TouchableOpacity 
//           onPress={() => {
//             socket?.close();
//             router.back();
//           }} 
//           style={styles.backButton}
//         >
//           <FontAwesome name="arrow-left" size={20} color="white" />
//         </TouchableOpacity>
//         <Text style={styles.header}>{userName}</Text>
//       </View>

//       {/* Messages List */}
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => {
//           const isCurrentUser = item.sender.id === currentUserId;
          
//           return (
//             <View style={[
//               styles.messageContainer, 
//               isCurrentUser ? styles.myMessageContainer : styles.otherMessageContainer
//             ]}>
//               <View style={[
//                 styles.messageBubble, 
//                 isCurrentUser ? styles.myMessageBubble : styles.otherMessageBubble
//               ]}>
//                 <Text style={styles.senderText}>
//                   {isCurrentUser ? 'You' : item.sender.username}
//                 </Text>
//                 <Text style={styles.messageText}>{item.content}</Text>
//                 <Text style={styles.timestamp}>
//                   {new Date(item.created_at).toLocaleTimeString()}
//                 </Text>
//               </View>
//             </View>
//           );
//         }}
//         onContentSizeChange={handleContentSizeChange} // Add this to trigger scrolling
//       />

//       {/* Input Area */}
//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Type a message..."
//           placeholderTextColor="gray"
//           value={inputText}
//           onChangeText={setInputText}
//         />
//         <TouchableOpacity 
//           onPress={sendMessage} 
//           style={styles.sendButton}
//           disabled={!inputText.trim()}
//         >
//           <FontAwesome 
//             name="send" 
//             size={20} 
//             color={inputText.trim() ? "white" : "gray"} 
//           />
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: 'black', 
//     padding: 10 
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'black'
//   },
//   loadingText: {
//     color: 'white',
//     fontSize: 18
//   },
//   headerContainer: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     paddingVertical: 10 
//   },
//   backButton: { 
//     padding: 8 
//   },
//   header: { 
//     color: 'white', 
//     fontSize: 18, 
//     fontWeight: 'bold', 
//     textAlign: 'center', 
//     flex: 1 
//   },
//   messageContainer: { 
//     flexDirection: 'row', 
//     alignItems: 'flex-end', 
//     marginBottom: 10 
//   },
//   myMessageContainer: { 
//     alignSelf: 'flex-end', 
//     flexDirection: 'row-reverse' 
//   },
//   otherMessageContainer: { 
//     alignSelf: 'flex-start' 
//   },
//   messageBubble: { 
//     padding: 10, 
//     borderRadius: 12, 
//     maxWidth: '75%' 
//   },
//   myMessageBubble: { 
//     backgroundColor: 'gray', 
//     alignSelf: 'flex-end' 
//   },
//   otherMessageBubble: { 
//     backgroundColor: '#222', 
//     alignSelf: 'flex-start' 
//   },
//   senderText: { 
//     fontSize: 12, 
//     color: 'green', 
//     marginBottom: 2 
//   },
//   messageText: { 
//     color: 'white', 
//     fontSize: 16 
//   },
//   timestamp: { 
//     fontSize: 12, 
//     color: 'white', 
//     marginTop: 5, 
//     alignSelf: 'flex-end' 
//   },
//   inputContainer: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     borderTopWidth: 1, 
//     borderTopColor: '#333', 
//     padding: 10 
//   },
//   input: { 
//     flex: 1, 
//     backgroundColor: '#222', 
//     color: 'white', 
//     padding: 10, 
//     borderRadius: 8, 
//     marginRight: 10 
//   },
//   sendButton: { 
//     backgroundColor: 'gray', 
//     padding: 10, 
//     borderRadius: 8 
//   },
// });


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../providers/DjangoAuthProvider';

// Improved Message Type with optional chaining
type Message = {
  id: number;
  chat: number;
  sender: {
    id: number;
    username: string;
  };
  content: string;
  created_at: string;
  is_read: boolean;
};

export default function ChatRoom() {
  const { id, userName } = useLocalSearchParams();
  const { accessToken, user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  console.log('First show the user', JSON.stringify(user))

  // Safely get user ID
  const currentUserId = user?.data.id ?? null;
  const currentUsername = user?.data.username ?? 'Unknown User';

  // Memoized fetch messages function
  const fetchMessages = useCallback(async () => {
    if (!accessToken) {
      Alert.alert('Authentication Error', 'No access token available');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/chats/${id}/messages/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data: Message[] = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Could not load messages');
    } finally {
      setIsLoading(false);
    }
  }, [id, accessToken]);

  // Establish WebSocket connection
  useEffect(() => {
    // Guard against missing authentication
    if (!accessToken || !currentUserId) {
      console.error('Missing authentication details');
      return;
    }

    // Create WebSocket
    const ws = new WebSocket(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/ws/chat/${id}/`);

    ws.onopen = () => {
      console.log("WebSocket Connected, Sending Authentication...");
      ws.send(JSON.stringify({ 
        type: "authentication", 
        token: accessToken 
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Validate message structure
        if (data.type === "error") {
          console.error("WebSocket Error:", data.message);
          return;
        }

        // Ensure sender is an object
        const normalizedMessage = {
          ...data,
          sender: typeof data.sender === 'number' 
            ? { id: data.sender, username: 'Unknown' }
            : data.sender
        };
        console.log("New WebSocket Message:", normalizedMessage);
        
        setMessages(prevMessages => {
          // Prevent duplicate messages
          console.log("prevMessages Message:", prevMessages);
          const isDuplicate = prevMessages.some(msg => msg.id === normalizedMessage.id);
          if (isDuplicate) return prevMessages;

          return [...prevMessages, normalizedMessage];
        });

        // Auto-scroll to bottom
        flatListRef.current?.scrollToEnd({ animated: true });
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      Alert.alert('Connection Error', 'Could not establish WebSocket connection');
    };

    setSocket(ws);

    // Fetch initial messages
    fetchMessages();

    // Cleanup function
    return () => {
      ws.close();
      setSocket(null);
    };
  }, [id, accessToken, currentUserId, fetchMessages]);

  // Scroll to the end when messages are fetched or updated
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages, isLoading]);

  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    if (!isLoading) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  // Send message handler with robust checks
  const sendMessage = useCallback(() => {
    if (!inputText.trim()) return;
    if (!socket) {
      Alert.alert('Connection Error', 'WebSocket is not connected');
      return;
    }
    if (!currentUserId) {
      Alert.alert('Authentication Error', 'User not authenticated');
      return;
    }

    const newMessage: Message = {
      id: Date.now(), // Temporary ID
      chat: Number(id),
      sender: {
        id: currentUserId,
        username: currentUsername
      },
      content: inputText,
      created_at: new Date().toISOString(),
      is_read: false
    };

    try {
      socket.send(JSON.stringify({
        type: 'chat_message',
        ...newMessage
      }));
      
      console.log('New messages', newMessage)
      // Optimistically update messages
      setMessages(prevMessages => [...prevMessages]); //newMessage
      setInputText('');
    } catch (error) {
      console.error('Message send error:', error);
      Alert.alert('Send Error', 'Could not send message');
    }
  }, [inputText, socket, id, currentUserId, currentUsername]);

  // Render loading state if necessary
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => {
            socket?.close();
            router.back();
          }} 
          style={styles.backButton}
        >
          <FontAwesome name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.header}>{userName}</Text>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isCurrentUser = item.sender.id === currentUserId;
          
          return (
            <View style={[
              styles.messageContainer, 
              isCurrentUser ? styles.myMessageContainer : styles.otherMessageContainer
            ]}>
              {/* Username displayed outside the bubble */}
              {!isCurrentUser && (
                <Text style={styles.usernameText}>
                  {item.sender.username}
                </Text>
              )}
              
              <View style={[
                styles.messageBubble, 
                isCurrentUser ? styles.myMessageBubble : styles.otherMessageBubble
              ]}>
                <Text style={styles.messageText}>{item.content}</Text>
                <Text style={styles.timestamp}>
                  {new Date(item.created_at).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          );
        }}
        onContentSizeChange={handleContentSizeChange}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="gray"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity 
          onPress={sendMessage} 
          style={styles.sendButton}
          disabled={!inputText.trim()}
        >
          <FontAwesome 
            name="send" 
            size={20} 
            color={inputText.trim() ? "white" : "gray"} 
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black'
  },
  loadingText: {
    color: 'white',
    fontSize: 18
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
  messageContainer: { 
    marginBottom: 16
  },
  myMessageContainer: { 
    alignItems: 'flex-end'
  },
  otherMessageContainer: { 
    alignItems: 'flex-start'
  },
  // Username style (outside bubble)
  usernameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9e9e9e',
    marginBottom: 4,
    marginLeft: 12
  },
  messageBubble: { 
    padding: 12,
    borderRadius: 18,
    maxWidth: '75%',
    // 3D effect shadows
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6
  },
  myMessageBubble: { 
    backgroundColor: '#0084ff',
    borderBottomRightRadius: 5, // iMessage style pointed edge
    // 3D light effect for my messages
    shadowColor: "#0077e6", 
    shadowOffset: { width: 0, height: 4 }
  },
  otherMessageBubble: { 
    backgroundColor: '#333',
    borderBottomLeftRadius: 5, // iMessage style pointed edge
    // 3D light effect for other messages
    shadowColor: "#222",
    shadowOffset: { width: 0, height: 4 }
  },
  messageText: { 
    color: 'white', 
    fontSize: 16 
  },
  timestamp: { 
    fontSize: 10, 
    color: 'rgba(255,255,255,0.7)', 
    marginTop: 4, 
    alignSelf: 'flex-end' 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderTopColor: '#333', 
    padding: 10,
    paddingTop: 15
  },
  input: { 
    flex: 1, 
    backgroundColor: '#222', 
    color: 'white', 
    padding: 12, 
    borderRadius: 20, 
    marginRight: 10,
    // Subtle inner shadow for depth
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4
  },
  sendButton: { 
    backgroundColor: '#0084ff', 
    padding: 12, 
    borderRadius: 50,
    // 3D effect on button
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
});