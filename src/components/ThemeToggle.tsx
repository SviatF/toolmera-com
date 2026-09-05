'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [theme,setTheme]=useState<Theme>('light');
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    const current=(document.documentElement.dataset.theme==='dark'?'dark':'light') as Theme;
    setTheme(current);
    setReady(true);
  },[]);

  function toggle(){
    const next:Theme=theme==='light'?'dark':'light';
    document.documentElement.dataset.theme=next;
    try{localStorage.setItem('toolmera-theme',next)}catch{}
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={toggle}
      aria-label={theme==='light'?'Switch to dark mode':'Switch to light mode'}
      title={theme==='light'?'Dark mode':'Light mode'}
    >
      <span className="themeToggleTrack" aria-hidden="true">
        <span className="themeToggleThumb">{ready&&theme==='dark'?<Moon size={14}/>:<Sun size={14}/>}</span>
      </span>
    </button>
  );
}
