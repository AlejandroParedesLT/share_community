import { Text, View, Image, Alert, ActivityIndicator,KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/Button';
import { useAuth } from '../../providers/DjangoAuthProvider';
import CustomTextInput from '../../components/CustomTextInput';

export default function ProfileScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [remoteImage, setRemoteImage] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, accessToken, logout } = useAuth();

  const getProfile = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const userid = user?.data?.id;
      const response = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/profile/${userid}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUsername(data.username);
      setBio(data.bio || '');
      setRemoteImage(data.presigned_image_url);
      console.log('Remote Image URL:', data.presigned_image_url);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      getProfile();
    }, [])
  );

  const updateProfile = async () => {
    if (!accessToken) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('bio', bio);

    if (image) {
      const localFile = {
        uri: image,
        type: 'image/jpeg',
        name: 'profile_picture.jpg',
      };
      formData.append('profile_picture', localFile as any);
    }
    console.log('Form Data:', formData);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/user/`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: formData,
      });
      console.log('Response:', response);
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      Alert.alert('Success', 'Profile updated successfully');
      setImage(null); // Clear local image selection
      getProfile(); // Refresh profile to reflect updated image
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
  >
    <View className="p-3 flex-1">
      {/* Avatar image picker */}
      <View className="relative self-center">
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" className="w-52 h-52 self-center" />
        ) : 
        remoteImage ? (
          <Image source={{ uri:remoteImage }} className="w-52 aspect-square self-center rounded-full bg-slate-300" />
        ) : (
          <View className="w-52 aspect-square self-center rounded-full bg-slate-300" />
        )}
      </View>

      <Text onPress={pickImage} className="text-blue-500 font-semibold m-5 self-center">
        Change
      </Text>

      {/* Form */}
      <View className="gap-5">
        <CustomTextInput label="Username" placeholder="Username" value={username} onChangeText={setUsername} editable={false} />

        <CustomTextInput label="Bio" placeholder="Bio" value={bio} onChangeText={setBio} multiline numberOfLines={3} />
      </View>

      {/* Buttons */}
      <View className="gap-2 mt-auto">
        <Button title="Update profile" onPress={updateProfile} disabled={loading} />
        <Button title="Sign out" onPress={handleLogout} />
      </View>
    </View>
    </KeyboardAvoidingView>
  );
}
