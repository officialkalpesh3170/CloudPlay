/**
 * Kalpesh Creator Space — Dedicated Custom Page for Kalpesh
 * "Build by Kalpesh"
 */

import { Crown, Sparkles, Terminal, Cpu, Flame, Gamepad2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePlayer } from "../context/usePlayer";
import { games } from "../lib/catalog";
import "../styles/kalpesh.css";

export default function Kalpesh() {
  const { profile } = usePlayer();

  return (
    <div className="kp-page">
      {/* ── Hero Banner ── */}
      <section className="kp-hero">
        <span className="kp-badge">
          <Crown size={14} /> Official Creator Space
        </span>

        <h1 className="kp-title">
          Build by <em>Kalpesh</em>
        </h1>

        <p className="kp-desc">
          Welcome to your dedicated platform space. This custom page is wired into CloudPlay's
          core routing and is ready for whatever custom dashboards, games, backend bridges,
          or personal modules you want to build next.
        </p>

        <div className="kp-signature-bar">
          <div className="kp-avatar-circle">⚡</div>
          <div className="kp-signature-info">
            <strong>Kalpesh · Lead Creator & Architect</strong>
            <small>CloudPlay Gaming Platform & Engine</small>
          </div>
        </div>
      </section>

      {/* ── Quick Platform Stats ── */}
      <section className="kp-stats-grid">
        <div className="kp-stat-card">
          <div className="kp-stat-icon">
            <Gamepad2 size={20} />
          </div>
          <div className="kp-stat-data">
            <strong>{games.length}</strong>
            <span>Active Game Titles</span>
          </div>
        </div>

        <div className="kp-stat-card">
          <div className="kp-stat-icon" style={{ borderColor: "rgba(0, 229, 255, 0.4)", color: "#00e5ff" }}>
            <Cpu size={20} />
          </div>
          <div className="kp-stat-data">
            <strong>60 FPS</strong>
            <span>Canvas & 3D Performance</span>
          </div>
        </div>

        <div className="kp-stat-card">
          <div className="kp-stat-icon" style={{ borderColor: "rgba(16, 185, 129, 0.4)", color: "#10b981" }}>
            <Terminal size={20} />
          </div>
          <div className="kp-stat-data">
            <strong>Online</strong>
            <span>Web Audio & Gyroscope Core</span>
          </div>
        </div>

        <div className="kp-stat-card">
          <div className="kp-stat-icon" style={{ borderColor: "rgba(245, 158, 11, 0.4)", color: "#facc15" }}>
            <Flame size={20} />
          </div>
          <div className="kp-stat-data">
            <strong>Level {Math.floor(Math.sqrt((profile.xp || 0) / 50)) + 1}</strong>
            <span>{profile.coins || 0} Coins in Vault</span>
          </div>
        </div>
      </section>

      {/* ── Custom Modules Hub ── */}
      <div className="kp-section-heading">
        <h2>Custom Modules & Architecture Hub</h2>
        <p>Pre-configured integration slots ready for your custom requirements.</p>
      </div>

      <div className="kp-modules-grid">
        {/* Module 1: Custom Games */}
        <div className="kp-module-card">
          <span className="kp-module-pill kp-module-pill--ready">Module 01 · Active</span>
          <h3>Game Pipeline & Integration</h3>
          <p>
            Connected to the CloudPlay catalog with 23 open-source and native games, universal
            mobile gamepad overlay, device tilt steering, and responsive touch controls.
          </p>
          <div className="kp-module-footer">
            <span>Status: 100% Operational</span>
            <Link to="/explore" style={{ color: "#38bdf8", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              Explore Catalog <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Module 2: FastAPI & Backend Integration */}
        <div className="kp-module-card">
          <span className="kp-module-pill kp-module-pill--waiting">Module 02 · Ready to Wire</span>
          <h3>FastAPI & Backend Bridge</h3>
          <p>
            Architecture ready for high-speed Python FastAPI backend connection. Plug in endpoints
            for player matchmaking, persistent leaderboards, live tournaments, and user accounts.
          </p>
          <div className="kp-module-footer">
            <span style={{ color: "#fde68a" }}>Waiting for custom endpoints</span>
            <span style={{ color: "#94a3b8" }}>Port: 8000</span>
          </div>
        </div>

        {/* Module 3: Creator Sandbox */}
        <div className="kp-module-card">
          <span className="kp-module-pill kp-module-pill--waiting">Module 03 · Standby</span>
          <h3>Creator Custom Studio</h3>
          <p>
            Tell me what custom tools, tournament brackets, AI opponents, or mini-games you want
            here. I will build and wire them directly into this page.
          </p>
          <div className="kp-module-footer">
            <span style={{ color: "#fde68a" }}>Ready for your instructions</span>
            <span style={{ color: "#a78bfa" }}>Built by Kalpesh</span>
          </div>
        </div>
      </div>

      {/* ── Placeholder Callout ── */}
      <div className="kp-placeholder-box">
        <div className="kp-placeholder-icon">
          <Sparkles size={24} />
        </div>
        <h3>Reserved for Kalpesh's Custom Build</h3>
        <p>
          "which i will tell you later ok just build by kalpesh" — This page is ready! Whenever you're ready
          with the details, just tell me what to build and it will be implemented right here.
        </p>
      </div>
    </div>
  );
}
