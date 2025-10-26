import React, { createContext, useState, useMemo, useEffect, useContext } from 'react';

// Helper to manipulate hex color lightness for generating shades
const adjustColor = (color: string, amount: number): string => {
  return '#' + color.replace(/^#/, '').replace(/../g, c => ('0' + Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).substr(-2));
};

// Helper to convert hex to an RGB object for use in rgba()
const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};


interface Theme {
  primaryColor: string;
  platformName: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>({
    primaryColor: '#3b82f6', // Default: blue-500
    platformName: 'Examify',
  });

  const themeStyles = useMemo(() => {
    const p500 = theme.primaryColor;
    const p600 = adjustColor(p500, -20);
    const p700 = adjustColor(p500, -40);
    const p400 = adjustColor(p500, 20);
    const p100 = adjustColor(p500, 180);
    const p800 = adjustColor(p500, -60);
    const p900 = adjustColor(p500, -80);
    const rgb = hexToRgb(p500);

    return `
      .bg-primary-100 { background-color: ${p100}; }
      .text-primary-800 { color: ${p800}; }
      .bg-primary-500 { background-color: ${p500}; }
      .hover\\:bg-primary-600:hover { background-color: ${p600}; }
      .text-primary-500 { color: ${p500}; }
      .text-primary-600 { color: ${p600}; }
      .hover\\:text-primary-500:hover { color: ${p500}; }
      .dark\\:text-primary-400 { color: ${p400}; }
      .border-primary-500 { border-color: ${p500}; }
      .focus\\:ring-primary-500:focus { --tw-ring-color: ${p500}; }
      .focus\\:border-primary-500:focus { border-color: ${p500}; }
      .from-primary-600 { --tw-gradient-from: ${p600} var(--tw-gradient-from-position); --tw-gradient-to: rgba(255, 255, 255, 0) var(--tw-gradient-to-position);--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
      .from-primary-700 { --tw-gradient-from: ${p700} var(--tw-gradient-from-position); --tw-gradient-to: rgba(255, 255, 255, 0) var(--tw-gradient-to-position);--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
      .to-primary-400 { --tw-gradient-to: ${p400} var(--tw-gradient-to-position); }
      .to-primary-900 { --tw-gradient-to: ${p900} var(--tw-gradient-to-position); }
      ${rgb ? `.hover\\:shadow-primary-500\\/20:hover { --tw-shadow-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2); --tw-shadow: var(--tw-shadow-colored); }` : ''}
      ${rgb ? `.hover\\:shadow-primary-500\\/10:hover { --tw-shadow-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1); --tw-shadow: var(--tw-shadow-colored); }` : ''}
    `;
  }, [theme.primaryColor]);

  useEffect(() => {
    const styleTagId = 'dynamic-theme-styles';
    let styleTag = document.getElementById(styleTagId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleTagId;
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = themeStyles;
  }, [themeStyles]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
