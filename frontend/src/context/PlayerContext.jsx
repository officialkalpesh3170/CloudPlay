/**
 * PlayerContext — shared player state across all pages.
 * Wraps the app so any component can read/update player data.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  loadProfile,
  saveProfile,
  recordGamePlay,
  toggleFavourite as toggleFavLib,
} from "../lib/playerStore";
import { PlayerContext } from "./PlayerContextInstance";

export function PlayerProvider({ children }) {
  const [profile, setProfile] = useState(loadProfile);
  const [newAchievements, setNewAchievements] = useState([]);
  const sessionStartRef = useRef(null);

  // Persist on every change
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const updateProfile = useCallback((updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const onGameStart = useCallback((gameId) => {
    sessionStartRef.current = Date.now();
    setProfile((prev) => {
      const { profile: updated, newAchievements: newA } = recordGamePlay(prev, gameId);
      if (newA.length > 0) setNewAchievements((old) => [...old, ...newA]);
      return updated;
    });
  }, []);

  const onGameEnd = useCallback(() => {
    if (sessionStartRef.current) {
      const seconds = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      sessionStartRef.current = null;
      if (seconds > 0) {
        setProfile((prev) => ({
          ...prev,
          playtimeSeconds: (prev.playtimeSeconds || 0) + seconds,
        }));
      }
    }
  }, []);

  const toggleFavourite = useCallback((gameId) => {
    setProfile((prev) => {
      const { profile: updated, newAchievements: newA } = toggleFavLib(prev, gameId);
      if (newA.length > 0) setNewAchievements((old) => [...old, ...newA]);
      return updated;
    });
  }, []);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  const value = useMemo(() => ({
    profile,
    updateProfile,
    onGameStart,
    onGameEnd,
    toggleFavourite,
    newAchievements,
    clearNewAchievements,
  }), [profile, updateProfile, onGameStart, onGameEnd, toggleFavourite, newAchievements, clearNewAchievements]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}
