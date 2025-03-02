import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack>
    {/* Ẩn tiêu đề của trang index */}
    <Stack.Screen name="index" options={{ headerShown: false }} />
  </Stack>
}
