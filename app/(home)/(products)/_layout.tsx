import { Stack } from 'expo-router'

const ProductLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="list" options={{ headerShown: false }} />
      <Stack.Screen name="add" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  )
}

export default ProductLayout