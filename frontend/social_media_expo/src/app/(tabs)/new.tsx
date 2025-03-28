// import { Text, View, Image, TextInput, Pressable, FlatList, Alert, ScrollView, Dimensions } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import { useEffect, useState } from 'react';
// import * as ImagePicker from 'expo-image-picker';
// import Button from '../../components/Button';
// import { uploadImage } from '../../lib/cloudinary';
// import { useAuth } from '../../providers/DjangoAuthProvider';
// import { router } from 'expo-router';

// const screenWidth = Dimensions.get('window').width;

// export default function CreatePost() {
//   const [caption, setCaption] = useState('');
//   const [media, setMedia] = useState<string | null>(null);
//   const [selectedItems, setSelectedItems] = useState<any[]>([]);
//   const [itemType, setItemType] = useState<number | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [items, setItems] = useState<any[]>([]);
//   const { accessToken } = useAuth();
//   let searchTimeout: NodeJS.Timeout | null = null; 

//   useEffect(() => {
//     if (itemType || searchQuery) {
//       if (searchTimeout) clearTimeout(searchTimeout);
//       searchTimeout = setTimeout(() => {
//         fetchItems();
//       }, 500); 
//     }
//     return () => {
//       if (searchTimeout) clearTimeout(searchTimeout);
//     };
//   }, [searchQuery, itemType]);

//   const fetchItems = async () => {
//     try {
//       const response = await fetch(
//         `${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/items/?type=${itemType}&search=${searchQuery}`,
//         {
//           method: 'GET',
//           headers: { Authorization: `Bearer ${accessToken}` },
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Failed to fetch items');
//       }

//       const data = await response.json();
//       console.log("API Response:", data);

//       setItems(Array.isArray(data) ? data : data.results || []);
//     } catch (error) {
//       Alert.alert('Error', error.message);
//     }
//   };

//   const pickMedia = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 0.5,
//     });

//     if (!result.canceled) {
//       setMedia(result.assets[0].uri);
//     }
//   };

//   const createPost = async () => {
//     if (!media || selectedItems.length === 0) {
//       Alert.alert('Error', 'You must select at least one item and upload an image.');
//       return;
//     }

//     const response = await uploadImage(media);

//     const postData = {
//       title,
//       content: caption,
//       image: response?.public_id,
//       items: selectedItems.map((item) => item.precordsid),
//     };
//     console.log("Post Data:", postData);
//     const res = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/posts/`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${accessToken}`,
//       },
//       body: JSON.stringify(postData),
//     });

//     if (!res.ok) {
//       Alert.alert('Error', 'Failed to create post.');
//       return;
//     }

//     router.push('/(tabs)');
//   };

//   return (
//     <View className="p-3 flex-1">
//       {/* Image Picker */}
//       {media ? (
//         <Image source={{ uri: media }} className="w-52 h-52 rounded-lg" />
//       ) : (
//         <Pressable onPress={pickMedia} className="p-5 bg-gray-300 rounded-lg">
//           <Text>Pick an Image</Text>
//         </Pressable>
//       )}

//       {/* Item Type Selection */}
//       <Picker selectedValue={itemType} onValueChange={(value) => setItemType(value)}>
//         <Picker.Item label="Select Type" value={null} />
//         <Picker.Item label="Music" value={1} />
//         <Picker.Item label="Books" value={2} />
//         <Picker.Item label="Movies" value={3} />
//       </Picker>

//       {/* Search Bar */}
//       {itemType && (<TextInput
//         placeholder="Search item..."
//         value={searchQuery}
//         onChangeText={setSearchQuery}
//         className="border p-2 my-2"
//       />)}

//       {/* Item List */}
//       <FlatList
//         data={items}
//         keyExtractor={(item) => item.precordsid.toString()}
//         renderItem={({ item }) => (
//           <Pressable
//             onPress={() => {
//               setSelectedItems((prev) =>
//                 prev.some((i) => i.precordsid === item.precordsid)
//                   ? prev.filter((i) => i.precordsid !== item.precordsid)
//                   : [...prev, item]
//               );
//             }}
//             className={`p-2 my-1 mx-1 rounded-lg ${
//               selectedItems.some((i) => i.precordsid === item.precordsid) ? 'bg-blue-200' : 'bg-white'
//             }`}
//           >
//             <Text>{item.title}</Text>
//           </Pressable>
//         )}
//       />

//       {/* Selected Items (Grid View) */}
//       <Text className="mt-3 font-semibold">Selected Items:</Text>
//       <ScrollView horizontal className="flex-row mt-2">
//         {selectedItems.map((item) => (
//           <View
//             key={item.precordsid}
//             style={{
//               width: screenWidth / 3 - 10, 
//               marginHorizontal: 5,
//               backgroundColor: '#f0f0f0',
//               padding: 5,
//               borderRadius: 10,
//               alignItems: 'center',
//             }}
//           >
//             {item.presigned_image_url ? (
//               <Image source={{ uri: item.presigned_image_url }} style={{ width: '100%', height: 80, borderRadius: 5 }} />
//             ) : (
//               <View style={{ width: '100%', height: 80, backgroundColor: '#ccc', borderRadius: 5 }} />
//             )}
//             <Text numberOfLines={1} className="text-center mt-1">{item.title}</Text>
//           </View>
//         ))}
//       </ScrollView>

//       {/* Submit Button */}
//       <Button title="Post" onPress={createPost} />
//     </View>
//   );
// }


import { Text, View, Image, TextInput, Pressable, FlatList, Alert, ScrollView, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../components/Button';
import { useAuth } from '../../providers/DjangoAuthProvider';
import { router } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [itemType, setItemType] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (itemType !== null) {
      fetchItems();
    }
  }, [itemType]); // Fetch items immediately when itemType changes

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery) fetchItems();
    }, 500);
    
    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const fetchItems = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/items/?type=${itemType}&search=${searchQuery}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(Array.isArray(data) ? data.slice(0, 5) : (data.results || []).slice(0, 5)); // Limit to 5 visible items
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
    }
  };

  const createPost = async () => {
    if (!media || selectedItems.length === 0 || !title) {
      Alert.alert('Error', 'You must select at least one item, set a title and upload an image.');
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", caption);
    //formData.append("items", JSON.stringify(selectedItems.map((item) => item.precordsid)) as any); // Ensure correct format
  
      // Convert items list to individual form fields
  selectedItems.forEach((item) => {
    formData.append("items", item.precordsid.toString()); // ✅ Send each item separately
  });

  // Extract file extension
  const fileType = media.split('.').pop();
  
  // Convert the image to a format React Native can handle
  formData.append("image", {
    uri: media,
    name: `upload.${fileType}`,
    type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
  } as unknown as Blob); // ✅ Ensure correct type


  console.log("Post Data:", formData);
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_DJANGO_API_URL}/api/posts/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`, // ✅ No need to manually set Content-Type
      },
      body: formData, // ✅ Send FormData directly
    });
    console.log("Response:", res);
    if (!res.ok) {
      throw new Error(`Failed to create post: ${res.status}`);
    }

    router.push('/(tabs)');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

  return (
    <View className="p-3 flex-1">
      <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>Make your post!</Text>

      {/* Title of the post */}
      <TextInput
        placeholder="Set a title for your post..."
        value={title}
        onChangeText={setTitle}
        className="border p-2 my-3 rounded-lg bg-gray-100"
      />

      {/* Image Picker */}
      {media ? (
        <Image source={{ uri: media }} className="w-52 h-52 rounded-lg" />
      ) : (
        <Pressable onPress={pickMedia} className="p-5 bg-gray-300 rounded-lg">
          <Text>Pick an Image</Text>
        </Pressable>
      )}

      {/* Item Type Selection */}
      <Picker selectedValue={itemType} onValueChange={(value) => setItemType(value)}>
        <Picker.Item label="Select Type" value={null} />
        <Picker.Item label="Music" value={1} />
        <Picker.Item label="Books" value={2} />
        <Picker.Item label="Movies" value={3} />
      </Picker>

      {/* Search Bar */}
      {itemType !== null && (
        <TextInput
          placeholder="Search item..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="border p-2 my-2 rounded-lg"
        />
      )}

      {/* Item List (Shows max 5, scrollable) */}
      <ScrollView style={{ maxHeight: 200 }}>
        {items.map((item) => (
          <Pressable
            key={item.precordsid}
            onPress={() => {
              setSelectedItems((prev) =>
                prev.some((i) => i.precordsid === item.precordsid)
                  ? prev.filter((i) => i.precordsid !== item.precordsid)
                  : [...prev, item]
              );
            }}
            className={`p-2 my-1 mx-1 rounded-lg ${
              selectedItems.some((i) => i.precordsid === item.precordsid) ? 'bg-blue-200' : 'bg-white'
            }`}
          >
            <Text>{item.title}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Selected Items (Grid View) */}
      {selectedItems.length > 0 && (
        <>
          <Text className="mt-3 font-semibold">Selected Items:</Text>
          <ScrollView horizontal className="flex-row mt-2">
            {selectedItems.map((item) => (
              <View
                key={item.precordsid}
                style={{
                  width: screenWidth / 3 - 10, 
                  marginHorizontal: 5,
                  backgroundColor: '#f0f0f0',
                  padding: 5,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                {item.presigned_image_url ? (
                  <Image source={{ uri: item.presigned_image_url }} style={{ width: '100%', height: 80, borderRadius: 5 }} />
                ) : (
                  <View style={{ width: '100%', height: 80, backgroundColor: '#ccc', borderRadius: 5 }} />
                )}
                <Text numberOfLines={1} className="text-center mt-1">{item.title}</Text>
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {/* Caption Input (Only visible after selecting at least one item) */}
      {selectedItems.length > 0 && (
        <TextInput
          placeholder="Write your caption..."
          value={caption}
          onChangeText={setCaption}
          className="border p-2 my-3 rounded-lg bg-gray-100"
        />
      )}

      {/* Submit Button */}
      <Button title="Post" onPress={createPost} />
    </View>
  );
}
