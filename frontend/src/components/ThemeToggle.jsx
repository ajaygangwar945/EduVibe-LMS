import React, { useState, useEffect } from 'react';

export default function ThemeToggle({ className = '', style = {} }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('eduvibe_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('eduvibe_theme', theme);
  }, [theme]);

  const toggle = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('eduvibe_theme', newTheme);
  };

  return (
    <div
      className={`apple-theme-switch ${className}`}
      role="group"
      aria-label="Theme Switcher"
      style={style}
    >
      <button
        type="button"
        className={`apple-theme-btn ${theme === 'light' ? 'active' : ''}`}
        onClick={() => toggle('light')}
        title="Switch to Apple Light Mode"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="sun-icon"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <span>Light</span>
      </button>

      <button
        type="button"
        className={`apple-theme-btn ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => toggle('dark')}
        title="Switch to Apple Dark Mode"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="moon-icon"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <span>Dark</span>
      </button>
    </div>
  );
}
