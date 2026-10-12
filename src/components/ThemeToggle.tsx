import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  return (
    <button
      type="button"
      className="themeToggle"
      data-theme-toggle
      aria-label="Switch color theme"
      title="Toggle color theme"
    >
      <span className="themeToggleTrack" aria-hidden="true">
        <span className="themeToggleThumb">
          <span className="themeToggleSun"><Sun size={14}/></span>
          <span className="themeToggleMoon"><Moon size={14}/></span>
        </span>
      </span>
    </button>
  );
}
