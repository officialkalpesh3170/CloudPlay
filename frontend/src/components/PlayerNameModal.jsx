import { useState } from "react";
import { Gamepad2, ArrowRight, Shuffle } from "lucide-react";
import { usePlayer } from "../context/usePlayer";
import { AVATARS, getAvatarEmoji } from "../lib/playerStore";
import "../styles/modal.css";

const SUGGESTED_NAMES = [
  "NeonRider", "PixelKnight", "VoidHunter", "StarBlast",
  "CyberAce", "QuantumX", "DarkMatter", "GlitchPilot",
  "IronFox", "CosmicWolf", "ZeroGravity", "TurboSpark",
];

function randomName() {
  return SUGGESTED_NAMES[Math.floor(Math.random() * SUGGESTED_NAMES.length)];
}

export default function PlayerNameModal() {
  const { updateProfile } = usePlayer();
  const [name, setName] = useState(randomName());
  const [selectedAvatar, setSelectedAvatar] = useState("fox");
  const [step, setStep] = useState(1); // 1 = name, 2 = avatar

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    updateProfile({
      name: trimmed,
      avatarId: selectedAvatar,
      createdAt: Date.now(),
    });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Create your player profile">
      <div className="modal-card">

        <div className="modal-header">
          <div className="modal-logo">
            <Gamepad2 size={26} />
          </div>
          <h1 className="modal-title">Welcome to CloudPlay</h1>
          <p className="modal-subtitle">
            Create your player identity to track progress, earn achievements and build your game library.
          </p>
        </div>

        {step === 1 ? (
          <div className="modal-step">
            <label className="modal-label" htmlFor="player-name">Your player name</label>
            <div className="modal-input-row">
              <input
                id="player-name"
                className="modal-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) setStep(2); }}
                maxLength={24}
                placeholder="Enter your name…"
                autoFocus
              />
              <button
                className="modal-shuffle"
                onClick={() => setName(randomName())}
                title="Suggest a name"
              >
                <Shuffle size={16} />
              </button>
            </div>
            <p className="modal-hint">This name will be displayed on your profile and achievements.</p>

            <button
              className="modal-btn"
              onClick={() => name.trim() && setStep(2)}
              disabled={!name.trim()}
            >
              Choose Avatar <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="modal-skip-btn"
              onClick={() => updateProfile({ name: name.trim() || "CyberRider", avatarId: selectedAvatar })}
              style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "12px", marginTop: "10px", cursor: "pointer", textDecoration: "underline" }}
            >
              Skip and play now
            </button>
          </div>
        ) : (
          <div className="modal-step">
            <label className="modal-label">Pick your avatar</label>
            <div className="modal-avatar-grid">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  className={`modal-avatar-btn ${selectedAvatar === av.id ? "modal-avatar-btn--active" : ""}`}
                  onClick={() => setSelectedAvatar(av.id)}
                  title={av.id}
                >
                  {av.emoji}
                </button>
              ))}
            </div>

            <div className="modal-preview">
              <div className="modal-preview-avatar">{getAvatarEmoji(selectedAvatar)}</div>
              <div>
                <strong>{name}</strong>
                <p>Ready to play!</p>
              </div>
            </div>

            <button className="modal-btn" onClick={handleSubmit}>
              Start Playing <ArrowRight size={16} />
            </button>
          </div>
        )}

        <div className="modal-progress">
          <div className={`modal-dot ${step >= 1 ? "modal-dot--active" : ""}`} />
          <div className={`modal-dot ${step >= 2 ? "modal-dot--active" : ""}`} />
        </div>
      </div>
    </div>
  );
}
