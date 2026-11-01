import { useState } from "react";
import { usePlayer } from "../context/usePlayer";
import {
  AVATARS, getAvatarEmoji, getPlayerLevel,
  getLevelProgress, formatPlaytime, ACHIEVEMENTS,
} from "../lib/playerStore";
import { games } from "../lib/catalog";
import { Edit3, Check, Trophy, Gamepad2, Clock, Coins, Zap } from "lucide-react";
import "../styles/profile.css";

export default function Profile() {
  const { profile, updateProfile } = usePlayer();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(profile.name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarId);

  const level = getPlayerLevel(profile.xp);
  const progress = getLevelProgress(profile.xp);

  const unlockedAch = ACHIEVEMENTS.filter((a) => (profile.achievements || []).includes(a.id));
  const totalGames = games.length;

  const save = () => {
    const name = draftName.trim();
    if (!name) return;
    updateProfile({ name, avatarId: selectedAvatar });
    setEditing(false);
  };

  return (
    <div className="profile">

      {/* ── Profile hero ─────────────────────────────────────────────── */}
      <section className="profile__hero">
        <div className="profile__avatar-wrap">
          <div className="profile__avatar">{getAvatarEmoji(selectedAvatar)}</div>
          {editing && (
            <div className="profile__avatar-picker">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  className={`profile__av-btn ${selectedAvatar === av.id ? "profile__av-btn--active" : ""}`}
                  onClick={() => setSelectedAvatar(av.id)}
                >
                  {av.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="profile__info">
          {editing ? (
            <div className="profile__edit-row">
              <input
                className="profile__name-input"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
                maxLength={24}
                autoFocus
              />
              <button className="profile__save-btn" onClick={save}>
                <Check size={16} /> Save
              </button>
            </div>
          ) : (
            <div className="profile__name-row">
              <h1 className="profile__name">{profile.name || "Guest"}</h1>
              <button className="profile__edit-btn" onClick={() => { setDraftName(profile.name || ""); setEditing(true); }}>
                <Edit3 size={15} /> Edit
              </button>
            </div>
          )}

          <div className="profile__level-info">
            <span className="profile__level-badge">Level {level}</span>
            <div className="profile__level-bar-wrap">
              <div className="profile__level-bar">
                <div className="profile__level-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="profile__level-pct">{Math.round(progress)}%</span>
            </div>
          </div>

          <p className="profile__member-since">
            Member since {profile.createdAt
              ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
              : "today"
            }
          </p>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section className="profile__stats">
        {[
          { icon: Zap,      color: "gold",   label: "Total XP",       val: profile.xp.toLocaleString() },
          { icon: Coins,    color: "cyan",   label: "Coins",          val: profile.coins.toLocaleString() },
          { icon: Gamepad2, color: "purple", label: "Sessions",       val: profile.totalPlays },
          { icon: Gamepad2, color: "green",  label: "Games Explored", val: `${(profile.uniqueGames||[]).length} / ${totalGames}` },
          { icon: Clock,    color: "orange", label: "Playtime",       val: formatPlaytime(profile.playtimeSeconds || 0) },
          { icon: Trophy,   color: "red",    label: "Achievements",   val: `${unlockedAch.length} / ${ACHIEVEMENTS.length}` },
        ].map(({ icon: Icon, color, label, val }) => (
          <div key={label} className="profile__stat-card">
            <div className={`profile__stat-icon profile__stat-icon--${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <span className="profile__stat-val">{val}</span>
              <small>{label}</small>
            </div>
          </div>
        ))}
      </section>

      {/* ── Achievements ──────────────────────────────────────────────── */}
      <section className="profile__section">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">UNLOCKED BADGES</p>
            <h2 className="section-title">Achievements</h2>
          </div>
        </div>
        {unlockedAch.length > 0 ? (
          <div className="profile__ach-list">
            {unlockedAch.map((a) => (
              <div key={a.id} className="profile__ach-badge">
                <span>{a.icon}</span>
                <strong>{a.title}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="profile__empty">Play games to unlock your first achievement!</p>
        )}
      </section>

      {/* ── Reset ─────────────────────────────────────────────────────── */}
      <section className="profile__section profile__reset-section">
        <h3>Reset Progress</h3>
        <p>This will permanently clear your XP, coins, playtime and achievements.</p>
        <button
          className="profile__reset-btn"
          onClick={() => {
            if (window.confirm("Reset all progress? This cannot be undone.")) {
              updateProfile({ xp: 0, coins: 0, totalPlays: 0, uniqueGames: [], recentlyPlayed: [], favourites: [], achievements: [], playtimeSeconds: 0 });
            }
          }}
        >
          Reset All Progress
        </button>
      </section>

    </div>
  );
}
