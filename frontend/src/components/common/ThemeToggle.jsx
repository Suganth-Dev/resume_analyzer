import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-lg bg-dark-900/60 hover:bg-dark-800/80 border border-dark-800/80 text-dark-400 hover:text-white transition-all cursor-pointer shadow-md flex items-center justify-center shrink-0"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-indigo-400" />
      ) : (
        <Sun className="w-5 h-5 text-amber-400 animate-pulse-slow" />
      )}
    </button>
  );
};

export default ThemeToggle;
