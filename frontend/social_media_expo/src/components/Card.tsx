import React  from "react";
import { Text ,View, StyleSheet, Image, Dimensions  } from 'react-native';
import {Card, Button , Title ,Paragraph } from 'react-native-paper';
import Carousel from 'react-native-reanimated-carousel';
const { width } = Dimensions.get("window");

// Simulated Backend Response
const simulatedBackendResponse = {
  title: "Test User",
  content: "This is a sample post content.",
  imageid: "12345",
  events: {
    "1": { item_id: "1", description: "Item 1" },
    "2": { item_id: "2", description: "Item 2" },
    "3": { item_id: "3", description: "Item 3" },
    "4": { item_id: "4", description: "Item 4" },
    "5": { item_id: "5", description: "Item 5" },
    "6": { item_id: "6", description: "Item 6" },
    "7": { item_id: "7", description: "Item 7" }
  }
};

const CreateCard = ({ data = simulatedBackendResponse }) => {
    const { title, events } = data;
    const cardWidth = width - 40; // Card width (full width minus margins)
    const carouselWidth = cardWidth * 0.9; // 90% of card width to maximize space
    const itemWidth = carouselWidth * 0.65; // Make items smaller to show more of neighbors
  
    // Transform backend response into an array
    const carouselData = Object.keys(events).map((key) => ({
      id: events[key].item_id,
      imageUri: "https://media.geeksforgeeks.org/wp-content/uploads/20220217151648/download3-200x200.png", // Placeholder
      description: events[key].description,
    }));
  
    // Renders each carousel item
    const renderItem = ({ item, index }) => (
      <View style={[styles.itemContainer, { width: itemWidth }]}>
        <Image 
          source={{ uri: item.imageUri }} 
          style={styles.image} 
        />
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  
    return (
      <Card style={styles.container}>
        <Card.Content>
          <Title>{title}</Title>
        </Card.Content>
        <View style={[styles.carouselContainer, { width: '100%' }]}>
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
            snapEnabled={true}
            pagingEnabled={true}
            panGestureHandlerProps={{
              activeOffsetX: [-8, 8],
            }}
            itemWidth={itemWidth}
          />
        </View>
      </Card>
    );
  };
  
  export default CreateCard;
  
  const styles = StyleSheet.create({
    container: {
      alignContent: "center",
      margin: 20,
      padding: 10,
      width: width - 40, // Calculate full width minus margins
    },
    carouselContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
      alignSelf: 'center',
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

