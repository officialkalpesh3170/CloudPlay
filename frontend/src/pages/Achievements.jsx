import { usePlayer } from "../context/usePlayer";
import { ACHIEVEMENTS, getPlayerLevel, getLevelProgress, getAvatarEmoji } from "../lib/playerStore";
import "../styles/achievements.css";

export default function Achievements() {
  const { profile } = usePlayer();
  const unlocked = new Set(profile.achievements || []);
  const level = getPlayerLevel(profile.xp);
  const progress = getLevelProgress(profile.xp);
  const avatar = getAvatarEmoji(profile.avatarId);

  const totalXpFromAch = ACHIEVEMENTS
    .filter((a) => unlocked.has(a.id))
    .reduce((sum, a) => sum + (a.xpReward || 0), 0);

  return (
    <div className="ach">
      <section className="ach__header">
        <div>
          <p className="section-eyebrow">YOUR MILESTONES</p>
          <h1 className="section-title">Achievements</h1>
          <p className="ach__sub">{unlocked.size} / {ACHIEVEMENTS.length} unlocked · {totalXpFromAch.toLocaleString()} XP earned</p>
        </div>

        {/* Level card */}
        <div className="ach__level-card">
          <div className="ach__level-avatar">{avatar}</div>
          <div>
            <strong>{profile.name || "Player"}</strong>
            <p>Level {level}</p>
            <div className="ach__level-bar">
              <div className="ach__level-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <small>{Math.round(progress)}% to Level {level + 1}</small>
          </div>
        </div>
      </section>

      <div className="ach__grid">
        {ACHIEVEMENTS.map((a) => {
          const done = unlocked.has(a.id);
          return (
            <div key={a.id} className={`ach__card ${done ? "ach__card--done" : "ach__card--locked"}`}>
              <div className="ach__icon">{done ? a.icon : "🔒"}</div>
              <div className="ach__body">
                <strong>{a.title}</strong>
                <p>{a.description}</p>
              </div>
              <div className="ach__xp">
                {done ? (
                  <span className="ach__xp-earned">+{a.xpReward} XP</span>
                ) : (
                  <span className="ach__xp-locked">{a.xpReward} XP</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
