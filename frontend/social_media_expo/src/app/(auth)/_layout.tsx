import { Redirect, Stack } from 'expo-router';
//import { useAuth } from '../../providers/AuthProvider';
import { useAuth } from '../../providers/DjangoAuthProvider';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack />;
}
