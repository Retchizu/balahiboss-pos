import { createStackNavigator } from "@react-navigation/stack";
import { DraftStackParamList } from "../types/type";
import DraftScreen from "../screens/mainDrawer/draft-stack/DraftScreen";
import DraftInfoScreen from "../screens/mainDrawer/draft-stack/DraftInfoScreen";

const DraftStack = createStackNavigator<DraftStackParamList>();
export const DraftStackScreen = () => (
  <DraftStack.Navigator screenOptions={{ headerShown: false }}>
    <DraftStack.Screen name="DraftScreen" component={DraftScreen} />
    <DraftStack.Screen name="DraftInfoScreen" component={DraftInfoScreen} />
  </DraftStack.Navigator>
);
