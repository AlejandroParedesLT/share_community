import { useEffect, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import PostListItem from '../../components/PostListItem';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/DjangoAuthProvider';
import CreateCard from '../../components/Card'

export default function FeedScreen() {

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { accessToken } = useAuth();  // Get the access token
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/posts/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`, // Add the auth token
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      console.log(data.results);
      const reversedPosts = data.results.reverse();
      setPosts(reversedPosts); // Update state with real posts
      
    } catch (error) {
      Alert.alert('Error with the connection itself', error.message);
    }
    setLoading(false);
  };


  return (
    <FlatList
      data={posts} // Replace with `posts` when backend is ready
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <CreateCard data={item}/>}
      contentContainerStyle={{
        gap: 10,
        maxWidth: 512,
        alignSelf: 'center',
        width: '100%',
      }}
      showsVerticalScrollIndicator={false}
      onRefresh={fetchPosts}
      refreshing={loading}
    />
  );
}