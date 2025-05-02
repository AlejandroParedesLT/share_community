import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Pressable, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// Define types for our events
interface EventLocation {
  latitude: number;
  longitude: number;
  address: string;
}

interface CulturalEvent {
  id: string;
  title: string;
  type: 'music' | 'movie';
  imageUrl: string;
  location: EventLocation;
  date: string;
}

// Simulated events data
const EVENTS_DATA: CulturalEvent[] = [
  {
    id: '1',
    title: 'Durham Music Festival',
    type: 'music',
    imageUrl: 'https://via.placeholder.com/400x250',
    location: {
      latitude: 36.0014,
      longitude: -78.9382,
      address: '123 Main St, Durham, NC 27701'
    },
    date: 'June 15-17, 2025'
  },
  {
    id: '2',
    title: 'Carolina Comic Con',
    type: 'movie',
    imageUrl: 'https://via.placeholder.com/400x250',
    location: {
      latitude: 35.9940,
      longitude: -78.8986,
      address: '300 Blackwell St, Durham, NC 27701'
    },
    date: 'July 8-10, 2025'
  },
  {
    id: '3',
    title: 'Indie Film Festival',
    type: 'movie',
    imageUrl: 'https://via.placeholder.com/400x250',
    location: {
      latitude: 36.0082,
      longitude: -78.9253,
      address: '120 Morris St, Durham, NC 27701'
    },
    date: 'August 22-24, 2025'
  },
  {
    id: '4',
    title: 'Jazz in the Park',
    type: 'music',
    imageUrl: 'https://via.placeholder.com/400x250',
    location: {
      latitude: 36.0025,
      longitude: -78.9138,
      address: 'Durham Central Park, 501 Foster St, Durham, NC 27701'
    },
    date: 'May 30, 2025'
  },
  {
    id: '5',
    title: 'Summer Beats Festival',
    type: 'music',
    imageUrl: 'https://via.placeholder.com/400x250',
    location: {
      latitude: 35.9975,
      longitude: -78.9044,
      address: 'American Tobacco Campus, 318 Blackwell St, Durham, NC 27701'
    },
    date: 'July 22-23, 2025'
  },
  {
    id: '6',
    title: 'Sci-Fi Film Marathon',
    type: 'movie',
    imageUrl: 'https://via.placeholder.com/400x250',
    location: {
      latitude: 35.9982,
      longitude: -78.9031,
      address: 'Carolina Theatre, 309 W Morgan St, Durham, NC 27701'
    },
    date: 'September 5-6, 2025'
  },
  {
    id: '7',
    title: 'Duke Classical Concert',
    type: 'music',
    imageUrl: 'https://via.placeholder.com/400x250',
    location: {
      latitude: 36.0025,
      longitude: -78.9376,
      address: 'Baldwin Auditorium, Duke University, Durham, NC 27708'
    },
    date: 'June 5, 2025'
  },
  {
    id: '8',
    title: 'Animation Celebration',
    type: 'movie',
    imageUrl: 'https://via.placeholder.com/400x250',
    location: {
      latitude: 36.0101,
      longitude: -78.9172,
      address: 'Durham Arts Council, 120 Morris St, Durham, NC 27701'
    },
    date: 'August 15-17, 2025'
  },
  {
    id: '9',
    title: 'Folk Music Gathering',
    type: 'music',
    imageUrl: 'https://via.placeholder.com/400x250',
    location: {
      latitude: 35.9924,
      longitude: -78.9220,
      address: 'Motorco Music Hall, 723 Rigsbee Ave, Durham, NC 27701'
    },
    date: 'July 1, 2025'
  },
  {
    id: '10',
    title: 'Documentary Week',
    type: 'movie',
    imageUrl: 'https://via.placeholder.com/400x250',
    location: {
      latitude: 36.0082,
      longitude: -78.9404,
      address: 'Full Frame Theater, 320 Blackwell St, Durham, NC 27701'
    },
    date: 'October 10-16, 2025'
  }
];

// Default region (Duke University)
const INITIAL_REGION: Region = {
  latitude: 36.0014,
  longitude: -78.9382,
  latitudeDelta: 0.0522,
  longitudeDelta: 0.0221,
};

export default function EventsMapScreen() {
  const [selectedEvent, setSelectedEvent] = useState<CulturalEvent | null>(null);
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const mapRef = useRef<MapView>(null);

  const resetToDefaultLocation = () => {
    mapRef.current?.animateToRegion(INITIAL_REGION, 1000);
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={setRegion}
      >
        {EVENTS_DATA.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.location.latitude,
              longitude: event.location.longitude,
            }}
            pinColor={event.type === 'music' ? '#E8C547' : '#9C27B0'}
            onPress={() => setSelectedEvent(event)}
          />
        ))}
      </MapView>

      {/* Reset location button */}
      <Pressable
        style={styles.resetButton}
        onPress={resetToDefaultLocation}
      >
        <Text style={styles.resetButtonText}>Duke University</Text>
      </Pressable>

      {/* Event type legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E8C547' }]} />
          <Text style={styles.legendText}>Music Events</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#9C27B0' }]} />
          <Text style={styles.legendText}>Movie Events</Text>
        </View>
      </View>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Animated.View 
          style={styles.eventDetailContainer}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.7)']}
            style={styles.eventDetailGradient}
          >
            <Pressable
              style={styles.closeButton}
              onPress={() => setSelectedEvent(null)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
            
            <View style={styles.eventImageContainer}>
              <Image
                source={{ uri: selectedEvent.imageUrl }}
                style={styles.eventImage}
                resizeMode="cover"
              />
              <View style={styles.eventTypeBadge}>
                <Text style={styles.eventTypeBadgeText}>
                  {selectedEvent.type === 'music' ? 'MUSIC' : 'FILM'}
                </Text>
              </View>
            </View>

            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
              <Text style={styles.eventDate}>{selectedEvent.date}</Text>
              <Text style={styles.eventAddress}>{selectedEvent.location.address}</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  map: {
    width: width,
    height: height,
  },
  resetButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8C547',
  },
  resetButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  legendContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 90,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    color: 'white',
    fontSize: 12,
  },
  eventDetailContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  eventDetailGradient: {
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventImageContainer: {
    position: 'relative',
    height: 150,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventTypeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#E8C547',
    borderRadius: 5,
  },
  eventTypeBadgeText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
  },
  eventDetails: {
    marginTop: 5,
  },
  eventTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Georgia',
  },
  eventDate: {
    color: '#E8C547',
    fontSize: 14,
    marginBottom: 8,
  },
  eventAddress: {
    color: '#CCCCCC',
    fontSize: 14,
  },
});