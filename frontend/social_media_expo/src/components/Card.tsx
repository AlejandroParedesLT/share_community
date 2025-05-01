import React from "react";
import { Text, View, StyleSheet, Image, Dimensions, ActivityIndicator } from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

const CreateCard = ({ data }) => {
  const { user, title, content, presigned_image_url, image, items } = data;

  const postImageUri = presigned_image_url || image;
  const cardWidth = width - 40;
  const carouselWidth = cardWidth * 0.9;
  const itemWidth = carouselWidth * 0.65;

  const carouselData = items.map((item) => ({
    id: item.precordsid,
    imageUri: item.presigned_image_url || item.image || "https://via.placeholder.com/150",
    description: item.description || "No description available",
  }));

  const renderItem = ({ item }) => (
    <View style={[styles.itemContainer, { width: itemWidth }]}>
      <Image source={{ uri: item.imageUri }} style={styles.image} />
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <Card style={styles.container}>
      <Card.Title title={user.username} />
      {postImageUri && <Card.Cover source={{ uri: postImageUri }} style={styles.postImage} />}
      <Card.Content>
        <Title>{title}</Title>
        <Paragraph>{title}: {content}</Paragraph>
      </Card.Content>
      {items.length > 0 && (
        <View style={[styles.carouselContainer, { width: "100%" }]}>
          <Carousel
            loop
            width={carouselWidth}
            height={200}
            data={carouselData}
            renderItem={renderItem}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 1.1,
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
    </Card>
  );
};

export default CreateCard;

const styles = StyleSheet.create({
  container: {
    alignContent: "center",
    margin: 20,
    padding: 10,
    width: width - 40,
  },
  postImage: {
    height: 200,
    resizeMode: "cover",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  carouselContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    alignSelf: "center",
  },
  itemContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 2,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  description: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});
