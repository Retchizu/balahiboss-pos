import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightPalette, darkPalette } from "@/theme/palettes";

const THEME_MODE_KEY = "THEME_MODE";

export type ThemeMode = "light" | "dark";

type ThemeContextType = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  primary: string;
  secondary: string;
  strongPrimary: string;
  textOnPrimary: string;
  textOnSecondary: string;
  textOnStrongPrimary: string;
  textMuted: string;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    AsyncStorage.getItem(THEME_MODE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark") {
        setThemeModeState(stored);
      }
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_MODE_KEY, mode);
  };

  const palette = themeMode === "dark" ? darkPalette : lightPalette;

  const value: ThemeContextType = {
    themeMode,
    setThemeMode,
    primary: palette.primary,
    secondary: palette.secondary,
    strongPrimary: palette.strongPrimary,
    textOnPrimary: palette.textOnPrimary,
    textOnSecondary: palette.textOnSecondary,
    textOnStrongPrimary: palette.textOnStrongPrimary,
    textMuted: palette.textMuted,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
