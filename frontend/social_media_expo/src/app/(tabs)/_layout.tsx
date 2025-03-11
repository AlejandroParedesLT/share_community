import { Redirect, Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../../providers/DjangoAuthProvider';
import NotificationProvider from '../../providers/NotificationProvider';

export default function TabsLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <NotificationProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: 'black',
          tabBarShowLabel: false,
          tabBarStyle: { backgroundColor: 'black' },
          headerStyle: { backgroundColor: 'black' },
          headerTitleStyle: { color: 'white', fontFamily: 'Brush Script MT' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
        headerTitle: 'Social',
        headerTitleAlign: 'left',
        headerRight: () => (
          <FontAwesome
            name="comments"
            size={26}
            color="white"
            style={{ marginRight: 15, fontFamily: 'FontAwesome' }}
            onPress={() => {
          // Navigate to group messages page
            }}
          />
        ),
        tabBarIcon: ({ color }) => (
          <FontAwesome name="home" size={26} color={color} />
        ),
          }}
        />

        <Tabs.Screen
          name="new"
          options={{
        headerTitle: 'Create post',
        headerTitleStyle: { fontFamily: 'Brush Script MT' },
        tabBarIcon: ({ color }) => (
          <FontAwesome name="plus-square-o" size={26} color={color} />
        ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
        headerTitle: 'Profile',
        headerTitleStyle: { fontFamily: 'Brush Script MT' },
        tabBarIcon: ({ color }) => (
          <FontAwesome name="user" size={26} color={color} />
        ),
          }}
        />
      </Tabs>
    </NotificationProvider>
  );
}
