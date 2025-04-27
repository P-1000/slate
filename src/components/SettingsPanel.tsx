import * as React from "react";
import { motion } from "framer-motion";
import { X, Moon, Sun, Monitor, Check } from "lucide-react";
import { cn } from "../utils/cn";
import { useTheme } from "../ThemeContext";

// Update the interface to include all the props being passed
interface SettingsPanelProps {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isDark: boolean;
  colorPalette: string;
  setColorPalette: (palette: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  blurAmount: number;
  setBlurAmount: (amount: number) => void;
  windowOpacity: number;
  setWindowOpacity: (opacity: number) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
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
  onClose 
}) => {
  // Get additional theme context values that aren't passed as props
  const { 
    currentPreset,
    applyPreset,
    availablePresets,
    availableColorPalettes,
    availableFonts
  } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed top-0 right-0 bottom-0 w-96 z-50",
        "glass-morphism glass-panel",
        isDark ? "glass-morphism-dark" : "glass-morphism-light",
        "border-l",
        isDark ? "border-dark-800" : "border-gray-200"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-800">
        <h2 className="text-xl font-semibold">Settings</h2>
        <button
          onClick={onClose}
          className={cn(
            "p-2 rounded-lg",
            "transition-colors duration-200",
            "hover:bg-gray-200/50 dark:hover:bg-dark-700/50"
          )}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className={cn(
        "p-6 overflow-y-auto h-[calc(100%-4rem)]",
        "scrollbar-thin scrollbar-thumb-rounded",
        isDark 
          ? "scrollbar-thumb-dark-700 scrollbar-track-dark-900" 
          : "scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      )}>
        {/* Theme Presets */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Theme Presets</h3>
          <div className="grid grid-cols-3 gap-3">
            {availablePresets.map((preset) => (
              <button
                key={preset}
                onClick={() => applyPreset(preset)}
                className={cn(
                  "p-3 rounded-lg text-center capitalize",
                  "transition-all duration-200",
                  "border-2",
                  currentPreset === preset
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-transparent hover:border-primary-500/30 hover:bg-primary-500/5"
                )}
              >
                <div className="flex justify-center mb-2">
                  {currentPreset === preset && (
                    <Check className="h-5 w-5 text-primary-500" />
                  )}
                </div>
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Mode */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Theme Mode</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                "flex-1 p-3 rounded-lg flex flex-col items-center gap-2",
                "transition-colors duration-200",
                theme === 'light'
                  ? "bg-primary-500/10 border-2 border-primary-500"
                  : "hover:bg-gray-200/50 dark:hover:bg-dark-700/50 border-2 border-transparent"
              )}
            >
              <Sun className={cn(
                "h-6 w-6",
                theme === 'light' ? "text-primary-500" : ""
              )} />
              <span>Light</span>
            </button>
            
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                "flex-1 p-3 rounded-lg flex flex-col items-center gap-2",
                "transition-colors duration-200",
                theme === 'dark'
                  ? "bg-primary-500/10 border-2 border-primary-500"
                  : "hover:bg-gray-200/50 dark:hover:bg-dark-700/50 border-2 border-transparent"
              )}
            >
              <Moon className={cn(
                "h-6 w-6",
                theme === 'dark' ? "text-primary-500" : ""
              )} />
              <span>Dark</span>
            </button>
            
            <button
              onClick={() => setTheme('system')}
              className={cn(
                "flex-1 p-3 rounded-lg flex flex-col items-center gap-2",
                "transition-colors duration-200",
                theme === 'system'
                  ? "bg-primary-500/10 border-2 border-primary-500"
                  : "hover:bg-gray-200/50 dark:hover:bg-dark-700/50 border-2 border-transparent"
              )}
            >
              <Monitor className={cn(
                "h-6 w-6",
                theme === 'system' ? "text-primary-500" : ""
              )} />
              <span>System</span>
            </button>
          </div>
        </div>
        
        {/* Color Palette */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Color Palette</h3>
          <div className="grid grid-cols-5 gap-3">
            {availableColorPalettes.map((palette) => (
              <button
                key={palette}
                onClick={() => setColorPalette(palette)}
                className={cn(
                  "aspect-square rounded-full",
                  "transition-all duration-200",
                  "border-4",
                  colorPalette === palette
                    ? "border-primary-500 scale-110"
                    : "border-transparent hover:border-gray-300 dark:hover:border-dark-600"
                )}
                style={{ 
                  backgroundColor: `var(--${palette}-color, var(--primary-color))` 
                }}
                title={palette.charAt(0).toUpperCase() + palette.slice(1)}
              />
            ))}
          </div>
        </div>
        
        {/* Font Family */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Font Family</h3>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value as any)}
            className={cn(
              "w-full p-3 rounded-lg",
              "glass-input",
              "focus:outline-none focus:ring-2 focus:ring-primary-500"
            )}
          >
            {availableFonts.map((font) => (
              <option key={font} value={font} className={`font-${font}`}>
                {font.charAt(0).toUpperCase() + font.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
          <div className={cn(
            "mt-4 p-4 rounded-lg",
            "glass-morphism glass-panel",
            isDark ? "glass-morphism-dark" : "glass-morphism-light"
          )}>
            <p className={`font-${fontFamily}`}>
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </div>
        
        {/* Blur Amount */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Blur Amount</h3>
            <span className="text-sm">{blurAmount}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={blurAmount}
            onChange={(e) => setBlurAmount(parseInt(e.target.value))}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-xs mt-1">
            <span>None</span>
            <span>Maximum</span>
          </div>
        </div>
        
        {/* Window Opacity */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Window Opacity</h3>
            <span className="text-sm">{Math.round(windowOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.01"
            value={windowOpacity}
            onChange={(e) => setWindowOpacity(parseFloat(e.target.value))}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-xs mt-1">
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* Reset Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => applyPreset('default')}
            className={cn(
              "px-4 py-2 rounded-lg",
              "transition-colors duration-200",
              "border border-gray-300 dark:border-dark-600",
              "hover:bg-gray-200/50 dark:hover:bg-dark-700/50"
            )}
          >
            Reset to Default
          </button>
        </div>
      </div>
    </motion.div>
  );
};