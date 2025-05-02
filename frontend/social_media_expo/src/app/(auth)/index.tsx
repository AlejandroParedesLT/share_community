// import React, { useState, useEffect } from 'react';
// import { Alert, StyleSheet, View, TextInput, Text, Animated, Dimensions, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { StatusBar } from 'expo-status-bar';
// import Button from '../../components/Button';
// import { useAuth } from '../../providers/DjangoAuthProvider';
// import Svg, { Path, Rect, G, Circle } from 'react-native-svg';

// export default function Auth() {
//   const { login } = useAuth();
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Animation values
//   const bookPageAnim = useState(new Animated.Value(0))[0];
//   const movieScreenAnim = useState(new Animated.Value(0))[0];
//   const musicNoteAnim = useState(new Animated.Value(0))[0];
//   const fadeAnim = useState(new Animated.Value(0))[0];

//   useEffect(() => {
//     // Fade in the form
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 1000,
//       useNativeDriver: true,
//     }).start();

//     // Animation loop for book pages
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(bookPageAnim, {
//           toValue: 1,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//         Animated.timing(bookPageAnim, {
//           toValue: 0,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();

//     // Animation loop for movie screen
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(movieScreenAnim, {
//           toValue: 1,
//           duration: 2000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(movieScreenAnim, {
//           toValue: 0,
//           duration: 2000,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();

//     // Animation loop for music note
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(musicNoteAnim, {
//           toValue: 1,
//           duration: 2500,
//           useNativeDriver: true,
//         }),
//         Animated.timing(musicNoteAnim, {
//           toValue: 0,
//           duration: 2500,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, []);

//   async function handleSignIn() {
//     setLoading(true);
//     const success = await login(username, password);
//     if (!success) {
//       Alert.alert('Login failed', 'Please check your credentials and try again.');
//     }
//     setLoading(false);
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar style="light" />
//       <LinearGradient 
//         colors={['#000000', '#1a1a1a', '#2a2a2a']} 
//         style={styles.container}
//       >
//         {/* Animated Icons */}
//         <View style={styles.animationContainer}>
//           {/* Book Animation */}
//           <Animated.View 
//             style={[
//               styles.iconContainer,
//               { 
//                 transform: [
//                   { translateY: bookPageAnim.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: [0, -20]
//                   }) },
//                   { scale: bookPageAnim.interpolate({
//                     inputRange: [0, 0.5, 1],
//                     outputRange: [1, 1.1, 1]
//                   }) }
//                 ],
//                 opacity: bookPageAnim.interpolate({
//                   inputRange: [0, 0.5, 1],
//                   outputRange: [0.7, 1, 0.7]
//                 })
//               }
//             ]}
//           >
//             <Svg width="50" height="50" viewBox="0 0 24 24" fill="white">
//               <G>
//                 <Path d="M21,4H3C2.4,4,2,4.4,2,5v14c0,0.6,0.4,1,1,1h18c0.6,0,1-0.4,1-1V5C22,4.4,21.6,4,21,4z M20,18H4V6h16V18z" />
//                 <Path d="M12,7v9c0,0,4.5-1.8,4.5-4.5S12,7,12,7z" />
//                 <Path d="M12,7v9c0,0-4.5-1.8-4.5-4.5S12,7,12,7z" />
//                 <Animated.View style={{
//                   opacity: bookPageAnim,
//                   transform: [{ rotateY: bookPageAnim.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: ['0deg', '180deg']
//                   }) }],
//                 }}>
//                   <Path d="M12,7v9" stroke="white" strokeWidth="0.5" />
//                 </Animated.View>
//               </G>
//             </Svg>
//           </Animated.View>

//           {/* Movie Screen Animation */}
//           <Animated.View 
//             style={[
//               styles.iconContainer,
//               { 
//                 transform: [
//                   { translateY: movieScreenAnim.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: [0, -15]
//                   }) }
//                 ],
//                 opacity: movieScreenAnim.interpolate({
//                   inputRange: [0, 0.5, 1],
//                   outputRange: [0.7, 1, 0.7]
//                 })
//               }
//             ]}
//           >
//             <Svg width="55" height="55" viewBox="0 0 24 24" fill="white">
//               <G>
//                 <Rect x="3" y="6" width="18" height="12" rx="1" />
//                 <Animated.View style={{
//                   opacity: movieScreenAnim.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: [0.3, 0.8]
//                   })
//                 }}>
//                   <Text style={styles.movieText}>MOVIES</Text>
//                 </Animated.View>
//               </G>
//             </Svg>
//           </Animated.View>

//           {/* Music Note Animation */}
//           <Animated.View 
//             style={[
//               styles.iconContainer,
//               { 
//                 transform: [
//                   { translateY: musicNoteAnim.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: [0, -25]
//                   }) },
//                   { rotate: musicNoteAnim.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: ['0deg', '15deg']
//                   }) }
//                 ],
//                 opacity: musicNoteAnim.interpolate({
//                   inputRange: [0, 0.5, 1],
//                   outputRange: [0.7, 1, 0.7]
//                 })
//               }
//             ]}
//           >
//             <Svg width="40" height="40" viewBox="0 0 24 24" fill="white">
//               <G>
//                 <Path d="M9,17.5c0,1.4-1.1,2.5-2.5,2.5S4,18.9,4,17.5S5.1,15,6.5,15S9,16.1,9,17.5z" />
//                 <Path d="M18,15c0,1.4-1.1,2.5-2.5,2.5S13,16.4,13,15s1.1-2.5,2.5-2.5S18,13.6,18,15z" />
//                 <Path d="M9,17V5l9-1.5V15" />
//               </G>
//             </Svg>
//           </Animated.View>
//         </View>

//         <KeyboardAvoidingView 
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           style={styles.formContainer}
//         >
//           <Animated.View style={[styles.formInner, { opacity: fadeAnim }]}>
//             <Text style={styles.title}>Welcome Back</Text>
            
//             <View style={styles.inputContainer}>
//               <TextInput
//                 onChangeText={setUsername}
//                 value={username}
//                 placeholder="Username"
//                 placeholderTextColor="#cccccc"
//                 autoCapitalize="none"
//                 style={styles.input}
//               />
//             </View>

//             <View style={styles.inputContainer}>
//               <TextInput
//                 onChangeText={setPassword}
//                 value={password}
//                 secureTextEntry={true}
//                 placeholder="Password"
//                 placeholderTextColor="#cccccc"
//                 autoCapitalize="none"
//                 style={styles.input}
//               />
//             </View>

//             <View style={styles.buttonContainer}>
//               <Button
//                 title="Sign In"
//                 disabled={loading}
//                 onPress={handleSignIn}
//                 style={styles.button}
//               />
//             </View>
//           </Animated.View>
//         </KeyboardAvoidingView>
//       </LinearGradient>
//     </SafeAreaView>
//   );
// }

// const { width, height } = Dimensions.get('window');

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#000000',
//   },
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   animationContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     width: width * 0.8,
//     marginBottom: 30,
//   },
//   iconContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 60,
//     height: 60,
//     marginHorizontal: 10,
//   },
//   movieText: {
//     color: 'white',
//     fontSize: 5,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginTop: -12,
//   },
//   formContainer: {
//     width: width * 0.85,
//     alignItems: 'center',
//   },
//   formInner: {
//     width: '100%',
//     padding: 25,
//     borderRadius: 15,
//     backgroundColor: 'rgba(255, 255, 255, 0.15)',
//     backdropFilter: 'blur(10px)',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     color: 'white',
//     fontWeight: 'bold',
//     marginBottom: 25,
//     textAlign: 'center',
//   },
//   inputContainer: {
//     width: '100%',
//     marginBottom: 15,
//   },
//   input: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 8,
//     padding: 15,
//     color: 'white',
//     width: '100%',
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   buttonContainer: {
//     width: '100%',
//     marginTop: 15,
//   },
//   button: {
//     backgroundColor: '#4A90E2',
//     borderRadius: 8,
//     padding: 15,
//     alignItems: 'center',
//   },
// });


import React, { useState, useEffect, useRef } from 'react';
import { Alert, StyleSheet, View, TextInput, Text, Animated, Dimensions, KeyboardAvoidingView, Platform, SafeAreaView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Button from '../../components/Button';
import { useAuth } from '../../providers/DjangoAuthProvider';

export default function Auth() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Image sequence state
  const [currentMovieImage, setCurrentMovieImage] = useState(0);
  const [currentMusicImage, setCurrentMusicImage] = useState(0);
  
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
  
  // Animation values
  const bookAnim = useState(new Animated.Value(0))[0];
  const movieAnim = useState(new Animated.Value(0))[0];
  const musicAnim = useState(new Animated.Value(0))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  // Timers for image cycling
  const movieTimerRef = useRef<NodeJS.Timeout | null>(null);
  const musicTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fade in the form
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

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

  async function handleSignIn() {
    setLoading(true);
    const success = await login(username, password);
    if (!success) {
      Alert.alert('Login failed', 'Please check your credentials and try again.');
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient 
        colors={['#000000', '#1a1a1a', '#2a2a2a']} 
        style={styles.container}
      >
        {/* Animated Media Icons */}
        <View style={styles.animationContainer}>
          {/* Book Animation */}
          <Animated.View 
            style={[
              styles.iconContainer,
              { 
                transform: [
                  { translateY: bookAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20]
                  }) },
                  { scale: bookAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.1, 1]
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
              style={styles.iconImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Movie Animation with cycling images */}
          <Animated.View 
            style={[
              styles.iconContainer,
              { 
                transform: [
                  { translateY: movieAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -15]
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
              style={styles.iconImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Music Note Animation with cycling images */}
          <Animated.View 
            style={[
              styles.iconContainer,
              { 
                transform: [
                  { translateY: musicAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -25]
                  }) },
                  { rotate: musicAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '15deg']
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
              style={styles.iconImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.formContainer}
        >
          <Animated.View style={[styles.formInner, { opacity: fadeAnim }]}>
            <Text style={styles.title}>Welcome Back</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                onChangeText={setUsername}
                value={username}
                placeholder="Username"
                placeholderTextColor="#cccccc"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                onChangeText={setPassword}
                value={password}
                secureTextEntry={true}
                placeholder="Password"
                placeholderTextColor="#cccccc"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Sign In"
                disabled={loading}
                onPress={handleSignIn}
                style={styles.button}
              />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width * 0.8,
    marginBottom: 30,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    marginHorizontal: 10,
  },
  iconImage: {
    width: 60,
    height: 60,
    // tintColor: 'white',
  },
  formContainer: {
    width: width * 0.85,
    alignItems: 'center',
  },
  formInner: {
    width: '100%',
    padding: 25,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 15,
    color: 'white',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 15,
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
});