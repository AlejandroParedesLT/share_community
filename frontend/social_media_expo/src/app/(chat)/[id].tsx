// import React, { useState, useEffect, useRef} from 'react';
// import { View, FlatList, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
// import { useLocalSearchParams, router } from 'expo-router';
// import { FontAwesome } from '@expo/vector-icons';
// import { useAuth } from '../../providers/DjangoAuthProvider';

// // ✅ Define the Message Type Based on API
// type Message = {
//   id: number;
//   chat: number;
//   sender: number;
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

//   const flatListRef = useRef<FlatList>(null);

//   console.log(user.data.id)
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
//       } catch (error) {
//         console.error('Error fetching messages:', error);
//       }
//     };
  
//     fetchMessages();
  
//     // ✅ Establish WebSocket Connection
//     const ws = new WebSocket(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/ws/chat/${id}/`);
  
//     ws.onopen = () => {
//       console.log("WebSocket Connected, Sending Authentication...");
//       ws.send(JSON.stringify({ type: "authentication", token: accessToken })); // ✅ Send token for authentication
//     };
  
//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log("New WebSocket Message:", data);
  
//       if (data.type === "error") {
//         console.error("WebSocket Authentication Failed:", data.message);
//         return;
//       }
  
//       setMessages((prevMessages) => [...prevMessages, data]); // ✅ Append new messages correctly
//     };
  
//     setSocket(ws);
  
//     return () => {
//       ws.close();
//     };
//   }, [id, accessToken]);

//   const sendMessage = () => {
//     if (inputText.trim() === '' || !socket || !user) return;
  
//     const message = {
//       type: "chat_message",  // ✅ Correct WebSocket type
//       chat: parseInt(id),
//       sender: user.data.id,       // ✅ Ensure sender ID is included
//       content: inputText,
//     };
  
//     console.log("Sending Message:", message);
//     socket.send(JSON.stringify(message)); // ✅ Send formatted message
//     setInputText('');
  
//     // ✅ Update UI instantly for better UX
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       { ...message, id: Date.now(), created_at: new Date().toISOString(), is_read: false },
//     ]);
//   };

//   return (
//     <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
//     <View style={styles.headerContainer}>
//       <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//         <FontAwesome name="arrow-left" size={20} color="white" />
//       </TouchableOpacity>
//       <Text style={styles.header}>{userName}</Text>
//     </View>

//     <FlatList
//       data={messages}
//       keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
//       renderItem={({ item }) => {
//         const isCurrentUser = user && item.sender === user.data.id;

//         return (
//           <View style={[styles.messageContainer, isCurrentUser ? styles.myMessageContainer : styles.otherMessageContainer]}>
//             <View style={[styles.messageBubble, isCurrentUser ? styles.myMessageBubble : styles.otherMessageBubble]}>
//               <Text style={styles.senderText}>User {item.sender}</Text>
//               <Text style={styles.messageText}>{item.content}</Text>
//               <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleTimeString()}</Text>
//             </View>
//           </View>
//         );
//       }}
//     />
//     <View style={styles.inputContainer}>
//       <TextInput
//         style={styles.input}
//         placeholder="Type a message..."
//         placeholderTextColor="gray"
//         value={inputText}
//         onChangeText={setInputText}
//       />
//       <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
//         <FontAwesome name="send" size={20} color="white" />
//       </TouchableOpacity>
//     </View>
//   </KeyboardAvoidingView>
//   );
// }

import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../providers/DjangoAuthProvider';

type Message = {
  id: number;
  chat: number;
  sender: {
    id: number;
    username: string;  // ✅ Now includes username
  };
  content: string;
  created_at: string;
  is_read: boolean;
};

export default function ChatRoom() {
  const { id, userName } = useLocalSearchParams();
  const { accessToken, user } = useAuth();
  console.log('First show the user', JSON.stringify(user))
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  // ✅ Add a ref to track the FlatList
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/chats/${id}/messages/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data: Message[] = await response.json();
        console.log("Fetched Messages:", data);
        setMessages(data);
        
        // ✅ Auto-scroll after fetching messages
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 500);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // ✅ Establish WebSocket Connection
    const ws = new WebSocket(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/ws/chat/${id}/`);

    ws.onopen = () => {
      console.log("WebSocket Connected, Sending Authentication...");
      ws.send(JSON.stringify({ type: "authentication", token: accessToken })); // ✅ Authenticate
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("New WebSocket Message:", data);
    
      if (data.type === "error") {
        console.error("WebSocket Authentication Failed:", data.message);
        return;
      }
    
      // ✅ Ensure WebSocket messages match API structure
      if (typeof data.sender === "number") {
        data.sender = { id: data.sender, username: "Unknown" };  // Prevent UI crashes
      }
    
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, data];
    
        // ✅ Auto-scroll after receiving a new message
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    
        return updatedMessages;
      });
    };
    

    setSocket(ws);

    // ✅ Cleanup function to close WebSocket on unmount
    return () => {
      console.log("Closing WebSocket on component unmount...");
      ws.close();
      setSocket(null);
    };
  }, [id, accessToken]);

  const sendMessage = () => {
    if (inputText.trim() === '' || !socket || !user) return;
  
    const message: Message = {
      id: Date.now(),  // ✅ Generate a temporary ID
      chat: parseInt(id),
      sender: { id: user.id, username: user.username },  // ✅ Match API format
      content: inputText,
      created_at: new Date().toISOString(),
      is_read: false,
    };
  
    console.log("Sending Message:", message);
    socket.send(JSON.stringify(message));
    setInputText('');
  
    setMessages((prevMessages) => [...prevMessages, message]);  // ✅ Now matches `Message` type
  };
  

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.headerContainer}>
        {/* <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="white" />
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => {
            if (socket) {
              console.log("Closing WebSocket before navigating back...");
              socket.close();  // ✅ Close WebSocket before navigating back
              setSocket(null); // ✅ Reset WebSocket state
            }
            router.back();  // ✅ Navigate back after closing WebSocket
          }}
          style={styles.backButton}
        >
          <FontAwesome name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.header}>{userName}</Text>
      </View>

      {/* ✅ Use `ref` in FlatList to enable auto-scroll */}
      {/* <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => {
          // ✅ Check if sender exists before rendering
          if (!item.sender || !item.sender.id) return null; 

          const isCurrentUser = user && item.sender.id === user.id;

          return (
            <View style={[styles.messageContainer, isCurrentUser ? styles.myMessageContainer : styles.otherMessageContainer]}>
              {!isCurrentUser && <Text style={styles.senderText}>{item.sender.username}</Text>}  
              <View style={[styles.messageBubble, isCurrentUser ? styles.myMessageBubble : styles.otherMessageBubble]}>
                <Text style={styles.messageText}>{item.content}</Text>
                <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleTimeString()}</Text>
              </View>
            </View>
          );
        }}
      /> */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => {
          console.log(user)
          console.log(item.sender)
          const isCurrentUser = user && item.sender.id === user.data.id;
          
          return (
            <View style={[styles.messageContainer, isCurrentUser ? styles.myMessageContainer : styles.otherMessageContainer]}>
              <View style={[styles.messageBubble, isCurrentUser ? styles.myMessageBubble : styles.otherMessageBubble]}>
                <Text style={styles.senderText}>{item.sender.username}</Text>
                <Text style={styles.messageText}>{item.content}</Text>
                <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleTimeString()}</Text>
              </View>
            </View>
          );
        }}
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


// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: 'black', padding: 10 },
//   headerContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
//   backButton: { padding: 8 },
//   header: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 },
//   message: { padding: 10, marginVertical: 5, borderRadius: 8, maxWidth: '75%' },
//   myMessage: { alignSelf: 'flex-end', backgroundColor: 'gray' },
//   otherMessage: { alignSelf: 'flex-start', backgroundColor: '#222' },
//   messageText: { color: 'white', fontSize: 16 },
//   timestamp: { color: 'gray', fontSize: 12, marginTop: 5 },
//   inputContainer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333', padding: 10 },
//   input: { flex: 1, backgroundColor: '#222', color: 'white', padding: 10, borderRadius: 8, marginRight: 10 },
//   sendButton: { backgroundColor: 'gray', padding: 10, borderRadius: 8 },
//   senderText: { fontWeight: 'bold', color: 'gray' },
// });
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', padding: 10 },
  
  headerContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  backButton: { padding: 8 },
  header: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 },

  messageContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  myMessageContainer: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  otherMessageContainer: { alignSelf: 'flex-start' },

  messageBubble: { padding: 10, borderRadius: 12, maxWidth: '75%' },
  myMessageBubble: { backgroundColor: 'gray', alignSelf: 'flex-end' },
  otherMessageBubble: { backgroundColor: '#222', alignSelf: 'flex-start' },

  senderText: { fontSize: 12, color: 'black', marginBottom: 2 },
  messageText: { color: 'white', fontSize: 16 },
  timestamp: { fontSize: 12, color: 'white', marginTop: 5, alignSelf: 'flex-end' },

  inputContainer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333', padding: 10 },
  input: { flex: 1, backgroundColor: '#222', color: 'white', padding: 10, borderRadius: 8, marginRight: 10 },
  sendButton: { backgroundColor: 'gray', padding: 10, borderRadius: 8 },
});
