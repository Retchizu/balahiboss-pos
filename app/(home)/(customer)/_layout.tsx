
import React from 'react'
import { Stack } from 'expo-router'

const CustomerStackLayout = () => {
  return (
    <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name="list" />
        <Stack.Screen name="add" />
    </Stack>
  )
}

export default CustomerStackLayout