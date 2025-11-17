import '../styles/globals.css';
import { ThemeProvider, useTheme } from '../lib/theme';
import { Moon, Sun } from 'lucide-react';

function ThemeToggleOverlay() {
  const th = useTheme();
  if (!th) return null;
  return (
    <div className="theme-toggle">
      <button
        aria-label="Toggle theme"
        onClick={th.toggle}
        className="p-3 rounded-full glass text-white hover:scale-105 transform transition shadow-lg"
        style={{ width: 52, height: 52 }}
      >
        {th.mode === 'dark' ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-indigo-300" />}
      </button>
    </div>
  );
}

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
      <ThemeToggleOverlay />
    </ThemeProvider>
  );
}
