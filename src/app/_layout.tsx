import { DarkTheme, Stack, ThemeProvider } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#090909",
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="evento/[id]" />
        <Stack.Screen name="reserva/[id]" />
        <Stack.Screen name="mis-reservas" />
      </Stack>
    </ThemeProvider>
  );
}
