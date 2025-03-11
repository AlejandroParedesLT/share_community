import React, { useState } from 'react';
import { Alert, StyleSheet, View, TextInput } from 'react-native';
import Button from '../../components/Button';
//import { getAccessToken, refreshAccessToken, login, logout } from '../../lib/django';
import { useAuth } from '../../providers/DjangoAuthProvider';
import axios from 'axios';

export default function Auth() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');

  // async function signInWithEmail() {
  //   setLoading(true);
  //   try {
  //     // Print environment variables to the console
  //     console.log('This is a log from the env variables: ', process.env.REACT_APP_BACKEND_URL);
  //     //const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/login/`, {
  //     const response = await axios.post(`http://192.168.87.1:8001/api/login/`, {
  //       username: username,
  //       email: email,
  //       password: password,
  //     });
  //     // Print the response to the console
  //     console.log(response);
  //     // If the response contains an error message, alert the user
  //     if (response.data.error) {
  //       Alert.alert(response.data.error);
  //     }
  //   } catch (error) {
  //     Alert.alert('An error occurred during sign in');
  //   }
  //   setLoading(false);
  // }

  // async function signUpWithEmail() {
  //   setLoading(true);
  //   try {
  //     //const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user/`, {
  //     const response = await axios.post(`http://192.168.87.1:8001/api/user/`, {
  //       username: username,
  //       email: email,
  //       password: password,
  //     });
  //     if (response.data.error) {
  //       Alert.alert(response.data.error);
  //     } else {
  //       Alert.alert('Please check your inbox for email verification!');
  //     }
  //   } catch (error) {
  //     Alert.alert('An error occurred during sign up');
  //   }
  //   setLoading(false);
  // }

  async function handleSignIn() {
    setLoading(true);
    const success = await login(email, password);
    if (!success) {
      Alert.alert('Login failed. Please check your credentials.');
    }
    setLoading(false);
  }

  async function handleSignUp() {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Please check your email for verification.');
      } else {
        Alert.alert('Sign-up failed', data.error || 'An error occurred.');
      }
    } catch (error) {
      Alert.alert('Sign-up error', 'Something went wrong.');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          onChangeText={(text) => setUsername(text)}
          value={username}
          placeholder="your username"
          autoCapitalize={'none'}
          keyboardType="default"
          className="border border-gray-300 p-3 rounded-md"
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          keyboardType="email-address"
          className="border border-gray-300 p-3 rounded-md"
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
          className="border border-gray-300 p-3 rounded-md"
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title="Sign in"
          disabled={loading}
          onPress={handleSignIn}
          //onPress={() => signInWithEmail()}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={loading}
          onPress={handleSignUp}
          //onPress={() => signUpWithEmail()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});
