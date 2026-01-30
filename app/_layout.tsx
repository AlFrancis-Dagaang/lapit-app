import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="drop-off"
          options={{ headerShown: true, title: "Drop-off" }}
        />
        <Stack.Screen
          name="pick-up-location"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="alert-config"
          options={{ headerShown: true, title: "Alert Configuration" }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
