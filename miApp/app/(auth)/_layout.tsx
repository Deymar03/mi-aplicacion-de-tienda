import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'select-role',
};

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="select-role" />
      <Stack.Screen name="login-user" />
      <Stack.Screen name="login-admin" />
    </Stack>
  );
}
