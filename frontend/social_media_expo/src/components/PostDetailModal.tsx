import React from "react";
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions 
} from "react-native";
import { Button, Card, Divider, IconButton } from "react-native-paper";
import Carousel from "react-native-reanimated-carousel";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const PostDetailModal = ({ visible, post, onClose }) => {
  const navigation = useNavigation();
  
  if (!post) return null;
  
  const { user, title, content, presigned_image_url, image, items, created_at } = post;
  const postImageUri = presigned_image_url || image;
  
  const carouselWidth = width * 0.8;
  const itemWidth = carouselWidth * 0.8;
  
  const formattedDate = new Date(created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const carouselData = items?.map((item) => ({
    id: item.precordsid,
    imageUri: item.presigned_image_url || item.image || "https://via.placeholder.com/150",
    description: item.description || "No description available",
  })) || [];

  const renderCarouselItem = ({ item }) => (
    <View style={[styles.carouselItem, { width: itemWidth }]}>
      <Image source={{ uri: item.imageUri }} style={styles.carouselImage} />
      <Text style={styles.carouselText}>{item.description}</Text>
    </View>
  );

  const navigateToProfile = () => {
    onClose();
    navigation.navigate("Profile", { userId: user.id });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <IconButton
            icon="close"
            size={24}
            style={styles.closeButton}
            onPress={onClose}
          />
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <TouchableOpacity onPress={navigateToProfile} style={styles.userInfo}>
                <Image
                  source={{ uri: user.avatar || "https://via.placeholder.com/50" }}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.username}>{user.username}</Text>
                  <Text style={styles.date}>{formattedDate}</Text>
                </View>
              </TouchableOpacity>
              <Button 
                mode="contained" 
                icon="account" 
                onPress={navigateToProfile}
                style={styles.profileButton}
              >
                Profile
              </Button>
            </View>
            
            <Text style={styles.title}>{title}</Text>
            
            {postImageUri && (
              <Image source={{ uri: postImageUri }} style={styles.mainImage} />
            )}
            
            <Text style={styles.content}>{content}</Text>
            
            {items && items.length > 0 && (
              <View style={styles.carouselContainer}>
                <Text style={styles.sectionTitle}>Related Items</Text>
                <Carousel
                  loop
                  width={carouselWidth}
                  height={240}
                  data={carouselData}
                  renderItem={renderCarouselItem}
                  mode="parallax"
                  modeConfig={{
                    parallaxScrollingScale: 0.9,
                    parallaxScrollingOffset: 50,
                  }}
                  defaultIndex={0}
                  snapEnabled
                  pagingEnabled
                  panGestureHandlerProps={{
                    activeOffsetX: [-8, 8],
                  }}
                  itemWidth={itemWidth}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PostDetailModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.85,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingRight: 40,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
  },
  date: {
    color: "gray",
    fontSize: 12,
  },
  profileButton: {
    borderRadius: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  mainImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 15,
    resizeMode: "cover",
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  carouselContainer: {
    marginVertical: 15,
  },
  carouselItem: {
    backgroundColor: "#f8f8f8",
    borderRadius: 15,
    padding: 10,
    alignItems: "center",
  },
  carouselImage: {
    width: "100%",
    height: 170,
    borderRadius: 10,
    resizeMode: "cover",
  },
  carouselText: {
    marginTop: 10,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
});