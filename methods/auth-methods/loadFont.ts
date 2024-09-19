import { useFonts } from "expo-font";

export const loadFont = () => {
  const [loaded] = useFonts({
    SoraExtraLight: require("../../assets/fonts/Sora-ExtraLight.ttf"),
    SoraLight: require("../../assets/fonts/Sora-Light.ttf"),
    SoraThin: require("../../assets/fonts/Sora-Thin.ttf"),
    SoraRegular: require("../../assets/fonts/Sora-Regular.ttf"),
    SoraMedium: require("../../assets/fonts/Sora-Medium.ttf"),
    SoraSemiBold: require("../../assets/fonts/Sora-SemiBold.ttf"),
    SoraBold: require("../../assets/fonts/Sora-Bold.ttf"),
    SoraExtraBold: require("../../assets/fonts/Sora-ExtraBold.ttf"),
  });

  return loaded;
};
