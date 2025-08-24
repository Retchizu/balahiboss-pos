import { Stack } from "expo-router"


const PrinterCofigLayout = () => {
  return (
    <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name="printer"/>
    </Stack>
  )
}

export default PrinterCofigLayout