import { useState } from 'react';

export function useViewMode(prefix = 'file') {
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem(`${prefix}ViewMode`);
    const defaultMode = `${prefix}_grid`;
    const listMode = `${prefix}_list`;
    return saved === listMode ? listMode : defaultMode;
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem(`${prefix}ViewMode`, mode);
  };

  return [viewMode, handleViewModeChange];
}