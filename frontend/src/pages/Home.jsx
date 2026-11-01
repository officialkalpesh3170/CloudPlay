/**
 * Home page — Featured hero, trending, recent, categories, new releases.
 */

import { Link, useNavigate } from "react-router-dom";
import {
  Play, ChevronRight, Clock, Flame, Sparkles,
  Star, Gamepad2, Zap, Trophy,
} from "lucide-react";
import { usePlayer } from "../context/usePlayer";
import {
  getFeaturedGames,
  getTrendingGames,
  getNewGames,
  games,
  GAME_CATEGORIES,
  getGameById,
} from "../lib/catalog";
import { getPlayerLevel, getLevelProgress, formatPlaytime } from "../lib/playerStore";
import GameCard from "../components/GameCard";
import "../styles/home.css";

const CATEGORY_ICONS = {
  Racing: "🏎️", Platformer: "🎯", Arcade: "👾", Puzzle: "🧩",
  Board: "🎲", Simulation: "🌍", Action: "⚡", Adventure: "🗺️",
  Strategy: "♟️",
};

export default function Home() {
  const { profile } = usePlayer();
  const navigate = useNavigate();

  const featured = getFeaturedGames();
  const heroGame = featured[0] ?? games[0];
  const trendingGames = getTrendingGames().slice(0, 6);
  const newGames = getNewGames().slice(0, 4);

  const recentIds = profile.recentlyPlayed || [];
  const recentGames = recentIds
    .map((id) => getGameById(id))
    .filter(Boolean)
    .slice(0, 4);

  const level = getPlayerLevel(profile.xp);
  const progress = getLevelProgress(profile.xp);

  const handlePlayHero = () => {
    navigate(`/play/${heroGame.id}`);
  };

  const categories = GAME_CATEGORIES.slice(1); // skip "All"

  return (
    <div className="home">

      {/* ── Welcome banner + stats ────────────────────────────────────── */}
      <section className="home__welcome">
        <div className="home__greeting">
          <p className="section-eyebrow">YOUR GAMING UNIVERSE</p>
          <h1 className="home__headline">
            {profile.name ? (
              <>Welcome back, <span className="home__name">{profile.name}.</span></>
            ) : (
              <>Welcome to <span className="home__name">CloudPlay.</span></>
            )}
          </h1>
          <p className="home__sub">Discover extraordinary games. Play instantly, no installs.</p>
        </div>

        {/* Player stats strip */}
        <div className="home__stats">
          <div className="home__stat">
            <div className="home__stat-icon home__stat-icon--purple"><Trophy size={18} /></div>
            <div>
              <span>Level {level}</span>
              <div className="home__level-bar">
                <div className="home__level-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
          <div className="home__stat">
            <div className="home__stat-icon home__stat-icon--gold"><Zap size={18} /></div>
            <div>
              <span className="home__stat-val">{profile.xp.toLocaleString()}</span>
              <small>Total XP</small>
            </div>
          </div>
          <div className="home__stat">
            <div className="home__stat-icon home__stat-icon--cyan"><Gamepad2 size={18} /></div>
            <div>
              <span className="home__stat-val">{profile.totalPlays}</span>
              <small>Sessions</small>
            </div>
          </div>
          <div className="home__stat">
            <div className="home__stat-icon home__stat-icon--green"><Clock size={18} /></div>
            <div>
              <span className="home__stat-val">{formatPlaytime(profile.playtimeSeconds || 0)}</span>
              <small>Playtime</small>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hero featured game ────────────────────────────────────────── */}
      <section className="home__hero" style={{ "--hero-img": `url(${heroGame.cover})` }}>
        <div className="home__hero-content">
          <div className="home__hero-label">
            <Sparkles size={13} />
            FEATURED GAME · {heroGame.category.toUpperCase()}
          </div>
          <h2 className="home__hero-title">{heroGame.title}</h2>
          <p className="home__hero-desc">{heroGame.description}</p>
          <div className="home__hero-actions">
            <button className="home__hero-play" onClick={handlePlayHero}>
              <Play size={18} fill="currentColor" />
              Play Now
            </button>
            <div className="home__hero-meta">
              <Star size={13} fill="currentColor" style={{ color: "var(--gold)" }} />
              <span>{heroGame.rating}</span>
              <span className="home__hero-dot" />
              <span>{heroGame.players}</span>
              <span className="home__hero-dot" />
              <span>{heroGame.controls}</span>
            </div>
          </div>
        </div>

        {/* Other featured games as side thumbnails */}
        {featured.length > 1 && (
          <div className="home__hero-others">
            {featured.slice(1, 3).map((g) => (
              <Link key={g.id} to={`/play/${g.id}`} className="home__hero-thumb">
                <img src={g.cover} alt={g.title} />
                <div className="home__hero-thumb-info">
                  <strong>{g.title}</strong>
                  <span>{g.category}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="home__hero-shade" />
      </section>

      {/* ── Recently played ───────────────────────────────────────────── */}
      {recentGames.length > 0 && (
        <section className="home__section">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">PICK UP WHERE YOU LEFT OFF</p>
              <h2 className="section-title">Recently Played</h2>
            </div>
            <Link to="/library" className="see-all-btn">See all <ChevronRight size={14} /></Link>
          </div>
          <div className="home__recent-grid">
            {recentGames.map((g) => (
              <Link key={g.id} to={`/play/${g.id}`} className="home__recent-card">
                <div className="home__recent-img">
                  <img src={g.cover} alt={g.title} />
                </div>
                <div className="home__recent-info">
                  <span className="home__recent-cat">{g.category}</span>
                  <strong>{g.title}</strong>
                  <p>{g.description}</p>
                </div>
                <div className="home__recent-play">
                  <Play size={16} fill="currentColor" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Trending games ────────────────────────────────────────────── */}
      <section className="home__section">
        <div className="section-header">
          <div>
            <p className="section-eyebrow"><Flame size={11} style={{ display:"inline", verticalAlign:"middle" }} /> WHAT'S HOT RIGHT NOW</p>
            <h2 className="section-title">Trending Games</h2>
          </div>
          <Link to="/explore" className="see-all-btn">Explore all <ChevronRight size={14} /></Link>
        </div>
        <div className="home__grid home__grid--3">
          {trendingGames.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      </section>

      {/* ── Game categories ───────────────────────────────────────────── */}
      <section className="home__section">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">BROWSE BY TYPE</p>
            <h2 className="section-title">Categories</h2>
          </div>
        </div>
        <div className="home__categories">
          {categories.map((cat) => {
            const count = games.filter((g) => g.category === cat).length;
            if (count === 0) return null;
            return (
              <Link
                key={cat}
                to={`/explore?cat=${encodeURIComponent(cat)}`}
                className="home__category-card"
              >
                <span className="home__category-icon">{CATEGORY_ICONS[cat] ?? "🎮"}</span>
                <strong>{cat}</strong>
                <small>{count} game{count !== 1 ? "s" : ""}</small>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── New releases ──────────────────────────────────────────────── */}
      {newGames.length > 0 && (
        <section className="home__section">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">FRESH ON THE PLATFORM</p>
              <h2 className="section-title">New Releases</h2>
            </div>
          </div>
          <div className="home__grid home__grid--4">
            {newGames.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      {/* ── All games quick access ────────────────────────────────────── */}
      <section className="home__section">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">THE FULL ARCADE</p>
            <h2 className="section-title">All Games</h2>
          </div>
          <Link to="/explore" className="see-all-btn">View all <ChevronRight size={14} /></Link>
        </div>
        <div className="home__grid home__grid--3">
          {games.slice(0, 6).map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="home__footer">
        <div className="home__footer-brand">
          <Gamepad2 size={18} />
          <span>Cloud<strong>Play</strong></span>
        </div>
        <p>Browser gaming, reimagined. Every game runs instantly.</p>
        <span>© 2026 CloudPlay · All games run locally or via licensed embeds.</span>
      </footer>

    </div>
  );
}
