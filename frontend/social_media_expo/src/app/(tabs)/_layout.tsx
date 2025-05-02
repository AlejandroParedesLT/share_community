// import { Redirect, Tabs, router } from 'expo-router';
// import FontAwesome from '@expo/vector-icons/FontAwesome';
// import { useAuth } from '../../providers/DjangoAuthProvider';
// import NotificationProvider from '../../providers/NotificationProvider';

// export default function TabsLayout() {
//   const { isAuthenticated } = useAuth();

//   if (!isAuthenticated) {
//     return <Redirect href="/(auth)" />;
//   }

//   return (
//     <NotificationProvider>
//       <Tabs
//         screenOptions={{
//           tabBarActiveTintColor: 'black',
//           tabBarShowLabel: false,
//           tabBarStyle: { backgroundColor: 'black' },
//           headerStyle: { backgroundColor: 'black' },
//           headerTitleStyle: { color: 'white', fontFamily: 'Brush Script MT' },
//         }}
//       >
//         <Tabs.Screen
//           name="index"
//           options={{
//             headerTitle: 'Social',
//             headerTitleAlign: 'left',
//             headerRight: () => (
//               <FontAwesome
//                 name="comments"
//                 size={26}
//                 color="white"
//                 style={{ marginRight: 15, fontFamily: 'FontAwesome' }}
//                 onPress={() => router.push('/(chat)')}
//               />
//             ),
//             tabBarIcon: ({ color }) => (
//               <FontAwesome name="home" size={26} color={"white"} />
//             ),
//           }}
//         />

//         <Tabs.Screen
//           name="new"
//           options={{
//             headerTitle: 'Create post',
//             headerTitleStyle: { fontFamily: 'Brush Script MT' },
//             tabBarIcon: ({ color }) => (
//               <FontAwesome name="plus-square-o" size={26} color={"white"} />
//             ),
//           }}
//         />

//         <Tabs.Screen
//           name="profile"
//           options={{
//             headerTitle: 'Profile',
//             headerTitleStyle: { fontFamily: 'Brush Script MT' },
//             tabBarIcon: ({ color }) => (
//               <FontAwesome name="user" size={26} color={"white"} />
//             ),
//           }}
//         />
//       </Tabs>
//     </NotificationProvider>
//   );
// }


// import { Redirect, Tabs, router } from 'expo-router';
// import FontAwesome from '@expo/vector-icons/FontAwesome';
// import { useAuth } from '../../providers/DjangoAuthProvider';
// import NotificationProvider from '../../providers/NotificationProvider';
// import { useState, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, Image, Animated, Dimensions } from 'react-native';

// // Custom header component with animations
// const AnimatedHeader = () => {
//   const [currentMovieImage, setCurrentMovieImage] = useState(0);
//   const [currentMusicImage, setCurrentMusicImage] = useState(0);
  
//   // Animation values
//   const bookAnim = useState(new Animated.Value(0))[0];
//   const movieAnim = useState(new Animated.Value(0))[0];
//   const musicAnim = useState(new Animated.Value(0))[0];
  
//   // Timers for image cycling
//   const movieTimerRef = useRef(null);
//   const musicTimerRef = useRef(null);
  
//   // Movie images array
//   const movieImages = [
//     require('../../../assets/movie_color_1.png'),
//     require('../../../assets/movie_color_2.png'),
//     require('../../../assets/movie_color_3.png')
//   ];
  
//   // Music images array
//   const musicImages = [
//     require('../../../assets/music_note.webp'),
//     require('../../../assets/music_2.webp'),
//     require('../../../assets/music_3.webp')
//   ];
  
//   // Book image
//   const bookImage = require('../../../assets/book.png');
  
//   useEffect(() => {
//     // Animation loop for book bouncing
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(bookAnim, {
//           toValue: 1,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//         Animated.timing(bookAnim, {
//           toValue: 0,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();

//     // Animation loop for movie bouncing
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(movieAnim, {
//           toValue: 1,
//           duration: 2000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(movieAnim, {
//           toValue: 0,
//           duration: 2000,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();

//     // Animation loop for music note bouncing
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(musicAnim, {
//           toValue: 1,
//           duration: 2500,
//           useNativeDriver: true,
//         }),
//         Animated.timing(musicAnim, {
//           toValue: 0,
//           duration: 2500,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
    
//     // Set up image cycling timers
//     movieTimerRef.current = setInterval(() => {
//       setCurrentMovieImage(prev => (prev + 1) % movieImages.length);
//     }, 800);
    
//     musicTimerRef.current = setInterval(() => {
//       setCurrentMusicImage(prev => (prev + 1) % musicImages.length);
//     }, 1000);
    
//     // Cleanup timers on unmount
//     return () => {
//       clearInterval(movieTimerRef.current);
//       clearInterval(musicTimerRef.current);
//     };
//   }, []);
  
//   return (
//     <View style={styles.headerContainer}>
//       <Text style={styles.headerTitle}>Slice of Culture</Text>
      
//       <View style={styles.iconsContainer}>
//         {/* Book Animation */}
//         <Animated.View 
//           style={[
//             styles.iconContainer,
//             { 
//               transform: [
//                 { translateY: bookAnim.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [0, -10]
//                 }) }
//               ],
//               opacity: bookAnim.interpolate({
//                 inputRange: [0, 0.5, 1],
//                 outputRange: [0.7, 1, 0.7]
//               })
//             }
//           ]}
//         >
//           <Image 
//             source={bookImage}
//             style={styles.headerIconImage}
//             resizeMode="contain"
//           />
//         </Animated.View>

//         {/* Movie Animation */}
//         <Animated.View 
//           style={[
//             styles.iconContainer,
//             { 
//               transform: [
//                 { translateY: movieAnim.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [0, -8]
//                 }) }
//               ],
//               opacity: movieAnim.interpolate({
//                 inputRange: [0, 0.5, 1],
//                 outputRange: [0.7, 1, 0.7]
//               })
//             }
//           ]}
//         >
//           <Image 
//             source={movieImages[currentMovieImage]}
//             style={styles.headerIconImage}
//             resizeMode="contain"
//           />
//         </Animated.View>

//         {/* Music Animation */}
//         <Animated.View 
//           style={[
//             styles.iconContainer,
//             { 
//               transform: [
//                 { translateY: musicAnim.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [0, -12]
//                 }) },
//                 { rotate: musicAnim.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: ['0deg', '10deg']
//                 }) }
//               ],
//               opacity: musicAnim.interpolate({
//                 inputRange: [0, 0.5, 1],
//                 outputRange: [0.7, 1, 0.7]
//               })
//             }
//           ]}
//         >
//           <Image 
//             source={musicImages[currentMusicImage]}
//             style={styles.headerIconImage}
//             resizeMode="contain"
//           />
//         </Animated.View>
//       </View>
//     </View>
//   );
// };

// export default function TabsLayout() {
//   const { isAuthenticated } = useAuth();

//   if (!isAuthenticated) {
//     return <Redirect href="/(auth)" />;
//   }

//   return (
//     <NotificationProvider>
//       <Tabs
//         screenOptions={{
//           tabBarActiveTintColor: '#E8C547', // Gold color for active tab
//           tabBarInactiveTintColor: '#999999', // Light gray for inactive tabs
//           tabBarShowLabel: false,
//           tabBarStyle: { 
//             backgroundColor: 'black',
//             borderTopColor: '#333333',
//           },
//           headerStyle: { backgroundColor: 'black' },
//           headerTitleStyle: { color: 'white' },
//           headerShadowVisible: false,
//         }}
//       >
//         <Tabs.Screen
//           name="index"
//           options={{
//             header: () => <AnimatedHeader />,
//             tabBarIcon: ({ color }) => (
//               <FontAwesome name="home" size={26} color={color} />
//             ),
//           }}
//         />

//         <Tabs.Screen
//           name="new"
//           options={{
//             headerTitle: 'Create Post',
//             headerTitleStyle: { 
//               color: 'white', 
//               fontFamily: 'Georgia',
//               fontSize: 20,
//             },
//             tabBarIcon: ({ color }) => (
//               <FontAwesome name="plus-square-o" size={26} color={color} />
//             ),
//           }}
//         />

//         <Tabs.Screen
//           name="profile"
//           options={{
//             headerTitle: 'Profile',
//             headerTitleStyle: { 
//               color: 'white', 
//               fontFamily: 'Georgia',
//               fontSize: 20,
//             },
//             tabBarIcon: ({ color }) => (
//               <FontAwesome name="user" size={26} color={color} />
//             ),
//           }}
//         />
//       </Tabs>
//     </NotificationProvider>
//   );
// }

// const { width } = Dimensions.get('window');

// const styles = StyleSheet.create({
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingTop: 50,
//     paddingBottom: 10,
//     backgroundColor: 'black',
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#333333',
//   },
//   headerTitle: {
//     color: 'white',
//     fontSize: 24,
//     fontFamily: 'Georgia',
//     fontWeight: '600',
//     letterSpacing: 0.5,
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//     textShadowColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   iconsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconContainer: {
//     width: 32,
//     height: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 10,
//   },
//   headerIconImage: {
//     width: 24,
//     height: 24,
//   },
// });

import { Redirect, Tabs, router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../../providers/DjangoAuthProvider';
import NotificationProvider from '../../providers/NotificationProvider';
import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions } from 'react-native';

// Custom header component with animations
const AnimatedHeader = () => {
  const [currentMovieImage, setCurrentMovieImage] = useState(0);
  const [currentMusicImage, setCurrentMusicImage] = useState(0);
  
  // Animation values
  const bookAnim = useState(new Animated.Value(0))[0];
  const movieAnim = useState(new Animated.Value(0))[0];
  const musicAnim = useState(new Animated.Value(0))[0];
  
  // Timers for image cycling
  const movieTimerRef = useRef(null);
  const musicTimerRef = useRef(null);
  
  // Movie images array
  const movieImages = [
    require('../../../assets/movie_color_1.png'),
    require('../../../assets/movie_color_2.png'),
    require('../../../assets/movie_color_3.png')
  ];
  
  // Music images array
  const musicImages = [
    require('../../../assets/music_note.webp'),
    require('../../../assets/music_2.webp'),
    require('../../../assets/music_3.webp')
  ];
  
  // Book image
  const bookImage = require('../../../assets/book.png');
  
  useEffect(() => {
    // Animation loop for book bouncing
    Animated.loop(
      Animated.sequence([
        Animated.timing(bookAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bookAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animation loop for movie bouncing
    Animated.loop(
      Animated.sequence([
        Animated.timing(movieAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(movieAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animation loop for music note bouncing
    Animated.loop(
      Animated.sequence([
        Animated.timing(musicAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(musicAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Set up image cycling timers
    movieTimerRef.current = setInterval(() => {
      setCurrentMovieImage(prev => (prev + 1) % movieImages.length);
    }, 800);
    
    musicTimerRef.current = setInterval(() => {
      setCurrentMusicImage(prev => (prev + 1) % musicImages.length);
    }, 1000);
    
    // Cleanup timers on unmount
    return () => {
      clearInterval(movieTimerRef.current);
      clearInterval(musicTimerRef.current);
    };
  }, []);
  
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Slice of Culture</Text>
      
      <View style={styles.iconsContainer}>
        
        {/* Book Animation */}
        <Animated.View 
          style={[
            styles.iconContainer,
            { 
              transform: [
                { translateY: bookAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10]
                }) }
              ],
              opacity: bookAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.7, 1, 0.7]
              })
            }
          ]}
        >
          <Image 
            source={bookImage}
            style={styles.headerIconImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Movie Animation */}
        <Animated.View 
          style={[
            styles.iconContainer,
            { 
              transform: [
                { translateY: movieAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -8]
                }) }
              ],
              opacity: movieAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.7, 1, 0.7]
              })
            }
          ]}
        >
          <Image 
            source={movieImages[currentMovieImage]}
            style={styles.headerIconImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Music Animation */}
        <Animated.View 
          style={[
            styles.iconContainer,
            { 
              transform: [
                { translateY: musicAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -12]
                }) },
                { rotate: musicAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '10deg']
                }) }
              ],
              opacity: musicAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.7, 1, 0.7]
              })
            }
          ]}
        >
          <Image 
            source={musicImages[currentMusicImage]}
            style={styles.headerIconImage}
            resizeMode="contain"
          />
        </Animated.View>

        <FontAwesome
          name="comments"
          size={26}
          color="white"
          style={styles.messagesIcon}
          onPress={() => router.push('/(chat)')}
        />

      </View>
    </View>
  );
};

export default function TabsLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <NotificationProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#E8C547', // Gold color for active tab
          tabBarInactiveTintColor: '#999999', // Light gray for inactive tabs
          tabBarShowLabel: false,
          tabBarStyle: { 
            backgroundColor: 'black',
            borderTopColor: '#333333',
          },
          headerStyle: { backgroundColor: 'black' },
          headerTitleStyle: { color: 'white', fontFamily: 'Georgia' },
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            header: () => <AnimatedHeader />,
            tabBarIcon: ({ color }) => (
              <FontAwesome name="home" size={26} color={color} />
            ),
          }}
        />

        {/* Uncomment this if you want to add a map screen*/}
        <Tabs.Screen
          name="events"
          options={{
            headerTitle: 'Cultural Events',
            headerTitleStyle: { 
              color: 'white', 
              fontFamily: 'Georgia',
              fontSize: 20,
            },
            tabBarIcon: ({ color }) => (
              <FontAwesome name="map-marker" size={26} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="new"
          options={{
            headerTitle: 'Create Post',
            headerTitleStyle: { 
              color: 'white', 
              fontFamily: 'Georgia',
              fontSize: 20,
            },
            tabBarIcon: ({ color }) => (
              <FontAwesome name="plus-square-o" size={26} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            headerTitle: 'Profile',
            headerTitleStyle: { 
              color: 'white', 
              fontFamily: 'Georgia',
              fontSize: 20,
            },
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user" size={26} color={color} />
            ),
          }}
        />
      </Tabs>
    </NotificationProvider>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: 'black',
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Georgia',
    fontWeight: '600',
    letterSpacing: 0.5,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerIconImage: {
    width: 24,
    height: 24,
  },
  messagesIcon: {
    marginRight: 15,
    marginLeft: 10,
  },
});