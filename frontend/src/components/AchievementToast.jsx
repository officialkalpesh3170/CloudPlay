import { useEffect } from "react";
import { ACHIEVEMENTS } from "../lib/playerStore";
import "../styles/modal.css";

export default function AchievementToast({ achievements, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="achievement-toast" role="status" aria-live="polite">
      {achievements.map((id) => {
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (!def) return null;
        return (
          <div key={id} className="achievement-toast-item">
            <span className="achievement-toast-icon">{def.icon}</span>
            <div className="achievement-toast-text">
              <strong>{def.title}</strong>
              <span>{def.description}</span>
              <div className="achievement-toast-badge">+{def.xpReward} XP</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
