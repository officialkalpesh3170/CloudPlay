/**
 * Layout — persistent shell with sidebar navigation.
 * Includes: sidebar, topbar, player name prompt (first visit).
 */

import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Gamepad2, Home, Compass, BookOpen, Trophy, User,
  Search, Bell, Menu, X, Zap, ChevronRight, Crown,
} from "lucide-react";
import { usePlayer } from "../context/usePlayer";
import { getPlayerLevel, getLevelProgress, getAvatarEmoji } from "../lib/playerStore";
import PlayerNameModal from "./PlayerNameModal";
import AchievementToast from "./AchievementToast";
import "../styles/layout.css";

const NAV_ITEMS = [
  { to: "/",             icon: Home,      label: "Home"     },
  { to: "/explore",      icon: Compass,   label: "Explore"  },
  { to: "/library",      icon: BookOpen,  label: "Library"  },
  { to: "/achievements", icon: Trophy,    label: "Trophies" },
  { to: "/profile",      icon: User,      label: "Profile"  },
  { to: "/kalpesh",      icon: Crown,     label: "Build by Kalpesh" },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { profile, newAchievements, clearNewAchievements } = usePlayer();

  const needsName = !profile.name;
  const level = getPlayerLevel(profile.xp);
  const progress = getLevelProgress(profile.xp);
  const avatar = getAvatarEmoji(profile.avatarId);

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/explore?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setSidebarOpen(false);
    }
  };

  return (
    <div className="layout">
      {/* ── Player name prompt ─────────────────────────────────── */}
      {needsName && <PlayerNameModal />}

      {/* ── Achievement toasts ─────────────────────────────────── */}
      {newAchievements.length > 0 && (
        <AchievementToast
          achievements={newAchievements}
          onClose={clearNewAchievements}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>

        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <Gamepad2 size={22} />
          </div>
          <span className="sidebar__wordmark">
            Cloud<span className="sidebar__accent">Play</span>
          </span>
          <button
            className="sidebar__close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav" role="navigation">
          <p className="sidebar__section-label">NAVIGATE</p>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `sidebar__nav-item ${isActive ? "sidebar__nav-item--active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className="sidebar__nav-arrow" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__bottom">
          {/* XP progress banner */}
          <div className="sidebar__xp-card">
            <div className="sidebar__xp-header">
              <Zap size={16} className="sidebar__xp-icon" />
              <span>Level {level}</span>
            </div>
            <div className="sidebar__xp-bar">
              <div
                className="sidebar__xp-fill"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="sidebar__xp-sub">{Math.round(progress)}% to next level</p>
          </div>

          {/* Player mini profile */}
          <div className="sidebar__profile">
            <div className="sidebar__avatar" aria-label="Player avatar">
              {avatar}
            </div>
            <div className="sidebar__player-info">
              <strong>{profile.name || "Guest"}</strong>
              <small>{profile.coins} coins · Lv {level}</small>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main ───────────────────────────────────────────────── */}
      <div className="layout__main">

        {/* Topbar */}
        <header className="topbar">
          <button
            className="topbar__menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="topbar__brand-mobile">
            <Gamepad2 size={18} />
            <span>Cloud<strong>Play</strong></span>
          </div>

          <div className="topbar__search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search games…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              aria-label="Search games"
            />
          </div>

          <div className="topbar__actions">
            <button className="topbar__action-btn" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <div className="topbar__avatar" aria-label="Player avatar">
              {avatar}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="layout__content">
          <Outlet />
        </main>

        {/* ── Mobile bottom navigation bar ──────────────────────── */}
        <nav className="bottom-nav" aria-label="Mobile navigation">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""}`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
