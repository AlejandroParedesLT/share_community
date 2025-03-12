import { useEffect, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import PostListItem from '../../components/PostListItem';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/DjangoAuthProvider';
import CreateCard from '../../components/Card'

export default function FeedScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    let { data, error } = await supabase
      .from('posts')
      .select('*, user:profiles(*), my_likes:likes(*), likes(count)')
      // .eq('id', 49) // show only my posts
      .eq('my_likes.user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Something went wrong');
    }
    // console.log(JSON.stringify(data, null, 2));
    setPosts(data);
    setLoading(false);
  };

    // Simulated Data for Testing
    const simulatedPosts = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      title: `Simulated Post ${i + 1}`,
      content: `This is a simulated post content for item ${i + 1}.`,
      imageid: `${i + 1}`,
      events: {
        "1": { item_id: "1", description: `Item ${i + 1} - 1` },
        "2": { item_id: "2", description: `Item ${i + 1} - 2` },
        "3": { item_id: "3", description: `Item ${i + 1} - 3` }
      }
    }));

  return (
    <FlatList
      data={simulatedPosts} // Replace with `posts` when backend is ready
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <CreateCard data={item} />}
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