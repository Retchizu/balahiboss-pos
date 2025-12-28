import { Stack } from 'expo-router'

const CategoryStackLayout = () => {
  return (
    <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name="list" />
        <Stack.Screen name="add" />
        <Stack.Screen name="[id]" />
    </Stack>
  )
}

export default CategoryStackLayout

