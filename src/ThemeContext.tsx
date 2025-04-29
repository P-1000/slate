import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ColorPalette = 
  | 'default' 
  | 'blue' 
  | 'purple' 
  | 'green' 
  | 'orange' 
  | 'pink' 
  | 'cyan' 
  | 'amber' 
  | 'indigo' 
  | 'rose' 
  | 'teal' 
  | 'emerald' 
  | 'violet' 
  | 'fuchsia' 
  | 'lime';

export type FontFamily = 
  | 'system' 
  | 'inter' 
  | 'roboto' 
  | 'poppins' 
  | 'montserrat' 
  | 'playfair' 
  | 'source-code-pro' 
  | 'open-sans' 
  | 'lato' 
  | 'merriweather' 
  | 'raleway' 
  | 'ubuntu' 
  | 'nunito' 
  | 'fira-code';

// New theme preset type
type ThemePreset = 'default' | 'minimal' | 'elegant' | 'vibrant' | 'professional' | 'creative' | 'modern' | 'classic' | 'futuristic';

// Theme preset configurations
interface PresetConfig {
  colorPalette: ColorPalette;
  fontFamily: FontFamily;
  blurAmount: number;
  windowOpacity: number;
}

const themePresets: Record<ThemePreset, PresetConfig> = {
  default: {
    colorPalette: 'default',
    fontFamily: 'system',
    blurAmount: 10,
    windowOpacity: 0.95
  },
  minimal: {
    colorPalette: 'blue',
    fontFamily: 'inter',
    blurAmount: 5,
    windowOpacity: 0.9
  },
  elegant: {
    colorPalette: 'indigo',
    fontFamily: 'playfair',
    blurAmount: 15,
    windowOpacity: 0.92
  },
  vibrant: {
    colorPalette: 'fuchsia',
    fontFamily: 'poppins',
    blurAmount: 12,
    windowOpacity: 0.97
  },
  professional: {
    colorPalette: 'teal',
    fontFamily: 'montserrat',
    blurAmount: 8,
    windowOpacity: 0.93
  },
  creative: {
    colorPalette: 'amber',
    fontFamily: 'nunito',
    blurAmount: 14,
    windowOpacity: 0.96
  },
  modern: {
    colorPalette: 'cyan',
    fontFamily: 'roboto',
    blurAmount: 10,
    windowOpacity: 0.94
  },
  classic: {
    colorPalette: 'emerald',
    fontFamily: 'merriweather',
    blurAmount: 7,
    windowOpacity: 0.91
  },
  futuristic: {
    colorPalette: 'violet',
    fontFamily: 'fira-code',
    blurAmount: 18,
    windowOpacity: 0.98
  }
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  colorPalette: ColorPalette;
  setColorPalette: (palette: ColorPalette) => void;
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
  blurAmount: number;
  setBlurAmount: (amount: number) => void;
  windowOpacity: number;
  setWindowOpacity: (opacity: number) => void;
  // New preset functionality
  currentPreset: ThemePreset;
  applyPreset: (preset: ThemePreset) => void;
  availablePresets: ThemePreset[];
  // Color palette and font options
  availableColorPalettes: ColorPalette[];
  availableFonts: FontFamily[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);
  const [colorPalette, setColorPalette] = useState<ColorPalette>('default');
  const [fontFamily, setFontFamily] = useState<FontFamily>('system');
  const [blurAmount, setBlurAmount] = useState<number>(10);
  const [windowOpacity, setWindowOpacity] = useState<number>(0.95);
  const [currentPreset, setCurrentPreset] = useState<ThemePreset>('default');

  // Available options
  const availableColorPalettes: ColorPalette[] = [
    'default', 'blue', 'purple', 'green', 'orange', 'pink', 'cyan', 
    'amber', 'indigo', 'rose', 'teal', 'emerald', 'violet', 'fuchsia', 'lime'
  ];
  
  const availableFonts: FontFamily[] = [
    'system', 'inter', 'roboto', 'poppins', 'montserrat', 'playfair', 
    'source-code-pro', 'open-sans', 'lato', 'merriweather', 'raleway', 
    'ubuntu', 'nunito', 'fira-code'
  ];
  
  const availablePresets: ThemePreset[] = [
    'default', 'minimal', 'elegant', 'vibrant', 'professional', 
    'creative', 'modern', 'classic', 'futuristic'
  ];

  // Apply a theme preset
  const applyPreset = (preset: ThemePreset) => {
    const config = themePresets[preset];
    setColorPalette(config.colorPalette);
    setFontFamily(config.fontFamily);
    setBlurAmount(config.blurAmount);
    setWindowOpacity(config.windowOpacity);
    setCurrentPreset(preset);
    localStorage.setItem('themePreset', preset);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const storedPalette = localStorage.getItem('colorPalette') as ColorPalette | null;
    const storedFont = localStorage.getItem('fontFamily') as FontFamily | null;
    const storedBlur = localStorage.getItem('blurAmount');
    const storedOpacity = localStorage.getItem('windowOpacity');
    const storedPreset = localStorage.getItem('themePreset') as ThemePreset | null;

    if (storedPreset) {
      applyPreset(storedPreset);
    } else {
      if (storedTheme) setTheme(storedTheme);
      if (storedPalette) setColorPalette(storedPalette);
      if (storedFont) setFontFamily(storedFont);
      if (storedBlur) setBlurAmount(parseInt(storedBlur));
      if (storedOpacity) setWindowOpacity(parseFloat(storedOpacity));
    }
  }, []);

  // Detect when settings have changed from a preset
  useEffect(() => {
    const currentConfig = {
      colorPalette,
      fontFamily,
      blurAmount,
      windowOpacity
    };
    
    // Check if current settings match any preset
    const matchingPreset = Object.entries(themePresets).find(
      ([_, config]) => 
        config.colorPalette === currentConfig.colorPalette &&
        config.fontFamily === currentConfig.fontFamily &&
        config.blurAmount === currentConfig.blurAmount &&
        config.windowOpacity === currentConfig.windowOpacity
    );
    
    if (matchingPreset) {
      setCurrentPreset(matchingPreset[0] as ThemePreset);
    } else if (currentPreset !== 'default') {
      // If settings don't match any preset, we're in a custom state
      setCurrentPreset('default');
    }
  }, [colorPalette, fontFamily, blurAmount, windowOpacity]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('colorPalette', colorPalette);
    document.documentElement.setAttribute('data-palette', colorPalette);
    
    // Set RGB variables for opacity calculations
    const rgbValues = {
      default: '16, 185, 129',
      blue: '59, 130, 246',
      purple: '139, 92, 246',
      green: '34, 197, 94',
      orange: '249, 115, 22',
      pink: '236, 72, 153',
      cyan: '6, 182, 212',
      amber: '245, 158, 11',
      indigo: '99, 102, 241',
      rose: '244, 63, 94',
      teal: '20, 184, 166',
      emerald: '16, 185, 129',
      violet: '139, 92, 246',
      fuchsia: '217, 70, 239',
      lime: '132, 204, 22'
    }[colorPalette];
    
    document.documentElement.style.setProperty('--primary-color-rgb', rgbValues);
  }, [colorPalette]);

  useEffect(() => {
    localStorage.setItem('fontFamily', fontFamily);
    document.documentElement.setAttribute('data-font', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('blurAmount', blurAmount.toString());
    document.documentElement.style.setProperty('--blur-amount', `${blurAmount}px`);
  }, [blurAmount]);

  // Update the useEffect that applies window opacity
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('windowOpacity', windowOpacity.toString());
    
    // Apply window opacity if in Electron environment
    if (window.ipcRenderer && typeof window.ipcRenderer.setWindowOpacity === 'function') {
      try {
        window.ipcRenderer.setWindowOpacity(windowOpacity)
          .catch(err => console.error('Error setting window opacity:', err));
      } catch (error) {
        console.error('Error calling setWindowOpacity:', error);
      }
    } else {
      console.warn('setWindowOpacity is not available in this environment');
      // Apply CSS-based opacity as fallback for browser environment
      document.documentElement.style.setProperty('--window-opacity', windowOpacity.toString());
    }
  }, [windowOpacity]);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      isDark,
      colorPalette,
      setColorPalette,
      fontFamily,
      setFontFamily,
      blurAmount,
      setBlurAmount,
      windowOpacity,
      setWindowOpacity,
      currentPreset,
      applyPreset,
      availablePresets,
      availableColorPalettes,
      availableFonts
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}