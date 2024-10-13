export const autoSignInGoogle = async (
  navigation: any,
  userString: string | null
) => {
  try {
    if (userString) {
      navigation.replace("DrawerScreen");
    } else {
      navigation.replace("SignInScreen");
    }
  } catch (error) {
    navigation.replace("SignInScreen");
  }
};
