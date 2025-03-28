// import React, { useState, useEffect, useRef } from 'react';
// import { View, FlatList, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
// import { useLocalSearchParams, router } from 'expo-router';
// import { FontAwesome } from '@expo/vector-icons';
// import { useAuth } from '../../providers/DjangoAuthProvider';

// type Message = {
//   id: number;
//   chat: number;
//   sender: {
//     id: number;
//     username: string;  // ✅ Now includes username
//   };
//   content: string;
//   created_at: string;
//   is_read: boolean;
// };

// export default function ChatRoom() {
//   const { id, userName } = useLocalSearchParams();
//   const { accessToken, user } = useAuth();
//   console.log('First show the user', JSON.stringify(user))
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputText, setInputText] = useState('');
//   const [socket, setSocket] = useState<WebSocket | null>(null);
  
//     // Add these console logs right at the beginning of the component
//     console.log('Raw useAuth output:', { accessToken, user });
//     console.log('User type:', typeof user);
//     console.log('User JSON:', JSON.stringify(user));

//   // ✅ Add a ref to track the FlatList
//   const flatListRef = useRef<FlatList>(null);

//   useEffect(() => {
//     const fetchMessages = async () => {
//       try {
//         const response = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/chats/${id}/messages/`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${accessToken}`,
//           },
//         });
//         const data: Message[] = await response.json();
//         console.log("Fetched Messages:", data);
//         setMessages(data);
        
//         // ✅ Auto-scroll after fetching messages
//         setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 500);
//       } catch (error) {
//         console.error('Error fetching messages:', error);
//       }
//     };

//     fetchMessages();
//     console.log(messages)
//     // ✅ Establish WebSocket Connection
//     const ws = new WebSocket(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/ws/chat/${id}/`);

//     ws.onopen = () => {
//       console.log("WebSocket Connected, Sending Authentication...");
//       ws.send(JSON.stringify({ type: "authentication", token: accessToken })); // ✅ Authenticate
//     };

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log("New WebSocket Message:", data);
    
//       if (data.type === "error") {
//         console.error("WebSocket Authentication Failed:", data.message);
//         return;
//       }
    
//       // ✅ Ensure WebSocket messages match API structure
//       if (typeof data.sender === "number") {
//         data.sender = { id: data.sender, username: "Unknown" };  // Prevent UI crashes
//       }
    
//       setMessages((prevMessages) => {
//         const updatedMessages = [...prevMessages, data];
    
//         // ✅ Auto-scroll after receiving a new message
//         setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    
//         return updatedMessages;
//       });
//     };
    

//     setSocket(ws);

//     // ✅ Cleanup function to close WebSocket on unmount
//     return () => {
//       console.log("Closing WebSocket on component unmount...");
//       ws.close();
//       setSocket(null);
//     };
//   }, [id, accessToken, user]);

//   const sendMessage = () => {
//     if (inputText.trim() === '' || !socket || !user) return;
  
//     const message: Message = {
//       id: Date.now(),
//       chat: parseInt(id),
//       sender: { id: user.id, username: user.username },
//       content: inputText,
//       created_at: new Date().toISOString(),
//       is_read: false,
//     };
  
//     console.log("Sending Message:", message);
//     socket.send(JSON.stringify(message));
//     setInputText('');
  
//     //setMessages((prevMessages) => [...prevMessages, message]);  // ✅ Now matches `Message` type
//     setMessages((prevMessages) => [...prevMessages]);
//   };
  

//   return (
//     <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
//       <View style={styles.headerContainer}>
//         {/* <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//           <FontAwesome name="arrow-left" size={20} color="white" />
//         </TouchableOpacity> */}
//         <TouchableOpacity
//           onPress={() => {
//             if (socket) {
//               console.log("Closing WebSocket before navigating back...");
//               socket.close();  // ✅ Close WebSocket before navigating back
//               setSocket(null); // ✅ Reset WebSocket state
//             }
//             router.back();  // ✅ Navigate back after closing WebSocket
//           }}
//           style={styles.backButton}
//         >
//           <FontAwesome name="arrow-left" size={20} color="white" />
//         </TouchableOpacity>
//         <Text style={styles.header}>{userName}</Text>
//       </View>

//       {/* ✅ Use `ref` in FlatList to enable auto-scroll */}
//       {/* <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
//         renderItem={({ item }) => {
//           // ✅ Check if sender exists before rendering
//           if (!item.sender || !item.sender.id) return null; 

//           const isCurrentUser = user && item.sender.id === user.id;

//           return (
//             <View style={[styles.messageContainer, isCurrentUser ? styles.myMessageContainer : styles.otherMessageContainer]}>
//               {!isCurrentUser && <Text style={styles.senderText}>{item.sender.username}</Text>}  
//               <View style={[styles.messageBubble, isCurrentUser ? styles.myMessageBubble : styles.otherMessageBubble]}>
//                 <Text style={styles.messageText}>{item.content}</Text>
//                 <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleTimeString()}</Text>
//               </View>
//             </View>
//           );
//         }}
//       /> */}
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={(item) => item.id?.toString()}
//         renderItem={({ item }) => {
//           console.log(user)
//           console.log(item)
//           const isCurrentUser = user && item.sender.id === user.id;
          
//           return (
//             <View style={[styles.messageContainer, isCurrentUser ? styles.myMessageContainer : styles.otherMessageContainer]}>
//               <View style={[styles.messageBubble, isCurrentUser ? styles.myMessageBubble : styles.otherMessageBubble]}>
//                 <Text style={styles.senderText}>{item.sender.username}</Text>
//                 <Text style={styles.messageText}>{item.content}</Text>
//                 <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleTimeString()}</Text>
//               </View>
//             </View>
//           );
//         }}
//       />

//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Type a message..."
//           placeholderTextColor="gray"
//           value={inputText}
//           onChangeText={setInputText}
//         />
//         <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
//           <FontAwesome name="send" size={20} color="white" />
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: 'black', padding: 10 },
  
//   headerContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
//   backButton: { padding: 8 },
//   header: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 },

//   messageContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
//   myMessageContainer: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
//   otherMessageContainer: { alignSelf: 'flex-start' },

//   messageBubble: { padding: 10, borderRadius: 12, maxWidth: '75%' },
//   myMessageBubble: { backgroundColor: 'gray', alignSelf: 'flex-end' },
//   otherMessageBubble: { backgroundColor: '#222', alignSelf: 'flex-start' },

//   senderText: { fontSize: 12, color: 'black', marginBottom: 2 },
//   messageText: { color: 'white', fontSize: 16 },
//   timestamp: { fontSize: 12, color: 'white', marginTop: 5, alignSelf: 'flex-end' },

//   inputContainer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333', padding: 10 },
//   input: { flex: 1, backgroundColor: '#222', color: 'white', padding: 10, borderRadius: 8, marginRight: 10 },
//   sendButton: { backgroundColor: 'gray', padding: 10, borderRadius: 8 },
// });

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, FlatList, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
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
      //flatListRef.current?.scrollToEnd({ animated: true });
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
      
      console.log('New messages',newMessage)
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
              <View style={[
                styles.messageBubble, 
                isCurrentUser ? styles.myMessageBubble : styles.otherMessageBubble
              ]}>
                <Text style={styles.senderText}>
                  {isCurrentUser ? 'You' : item.sender.username}
                </Text>
                <Text style={styles.messageText}>{item.content}</Text>
                <Text style={styles.timestamp}>
                  {new Date(item.created_at).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          );
        }}
        onContentSizeChange={handleContentSizeChange} // Add this to trigger scrolling
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
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    marginBottom: 10 
  },
  myMessageContainer: { 
    alignSelf: 'flex-end', 
    flexDirection: 'row-reverse' 
  },
  otherMessageContainer: { 
    alignSelf: 'flex-start' 
  },
  messageBubble: { 
    padding: 10, 
    borderRadius: 12, 
    maxWidth: '75%' 
  },
  myMessageBubble: { 
    backgroundColor: 'gray', 
    alignSelf: 'flex-end' 
  },
  otherMessageBubble: { 
    backgroundColor: '#222', 
    alignSelf: 'flex-start' 
  },
  senderText: { 
    fontSize: 12, 
    color: 'green', 
    marginBottom: 2 
  },
  messageText: { 
    color: 'white', 
    fontSize: 16 
  },
  timestamp: { 
    fontSize: 12, 
    color: 'white', 
    marginTop: 5, 
    alignSelf: 'flex-end' 
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