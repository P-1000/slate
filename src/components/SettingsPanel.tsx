import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";
import { Button } from "./ui/Button";
import { Theme, ColorPalette, FontFamily } from "../types";

interface SettingsPanelProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  colorPalette: ColorPalette;
  setColorPalette: (palette: ColorPalette) => void;
  fontFamily: FontFamily;
  setFontFamily: (family: FontFamily) => void;
  blurAmount: number;
  setBlurAmount: (amount: number) => void;
  windowOpacity: number;
  setWindowOpacity: (opacity: number) => void;
  onClose: () => void;
}

const availableFonts: FontFamily[] = ['inter', 'system', 'mono'];

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
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          isDark ? "bg-dark-900/90" : "bg-white/90"
        )}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={cn(
            "relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl",
            isDark ? "bg-dark-800" : "bg-white",
            "border",
            isDark ? "border-dark-700" : "border-gray-200"
          )}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className={cn(
                "text-xl font-semibold",
                isDark ? "text-white" : "text-gray-900"
              )}>
                Settings
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  isDark 
                    ? "hover:bg-white/5 text-gray-400" 
                    : "hover:bg-black/5 text-gray-500"
                )}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-8">
              {/* Theme */}
              <div>
                <h3 className={cn(
                  "text-lg font-medium mb-4",
                  isDark ? "text-gray-200" : "text-gray-900"
                )}>
                  Theme
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      theme === 'light'
                        ? "border-primary-500 bg-primary-500/10"
                        : isDark
                          ? "border-dark-700 hover:border-dark-600"
                          : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-white border border-gray-200" />
                      <span className={cn(
                        "text-sm font-medium",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}>
                        Light
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      theme === 'dark'
                        ? "border-primary-500 bg-primary-500/10"
                        : isDark
                          ? "border-dark-700 hover:border-dark-600"
                          : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-900 border border-gray-700" />
                      <span className={cn(
                        "text-sm font-medium",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}>
                        Dark
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <h3 className={cn(
                  "text-lg font-medium mb-4",
                  isDark ? "text-gray-200" : "text-gray-900"
                )}>
                  Font Family
                </h3>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                  className={cn(
                    "w-full p-3 rounded-lg border",
                    isDark 
                      ? "bg-dark-700 border-dark-600 text-white" 
                      : "bg-white border-gray-200 text-gray-900",
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
                  "mt-4 p-4 rounded-lg border",
                  isDark 
                    ? "bg-dark-700 border-dark-600" 
                    : "bg-white border-gray-200"
                )}>
                  <p className={`font-${fontFamily}`}>
                    The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
              </div>

              {/* Blur Amount */}
              <div>
                <h3 className={cn(
                  "text-lg font-medium mb-4",
                  isDark ? "text-gray-200" : "text-gray-900"
                )}>
                  Blur Amount
                </h3>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={blurAmount}
                  onChange={(e) => setBlurAmount(Number(e.target.value))}
                  className="w-full accent-primary-500"
                />
                <div className="flex justify-between text-xs mt-1">
                  <span className={cn(
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    {blurAmount}px
                  </span>
                </div>
              </div>

              {/* Window Opacity */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={cn(
                    "text-lg font-medium",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    Window Opacity
                  </h3>
                  <span className={cn(
                    "text-sm",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    {Math.round(windowOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.05"
                  value={windowOpacity}
                  onChange={(e) => setWindowOpacity(parseFloat(e.target.value))}
                  className="w-full accent-primary-500"
                />
                <div className="flex justify-between text-xs mt-1">
                  <span className={cn(
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    More Transparent
                  </span>
                  <span className={cn(
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    Less Transparent
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};