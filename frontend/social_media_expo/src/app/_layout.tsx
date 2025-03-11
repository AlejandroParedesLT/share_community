import { Stack } from 'expo-router';
import '../../global.css';
import AuthProvider from '../providers/DjangoAuthProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
