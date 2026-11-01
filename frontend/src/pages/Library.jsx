import { Link } from "react-router-dom";
import { Heart, BookOpen, Clock } from "lucide-react";
import { usePlayer } from "../context/usePlayer";
import { getGameById } from "../lib/catalog";
import GameCard from "../components/GameCard";
import { formatPlaytime } from "../lib/playerStore";
import "../styles/library.css";

export default function Library() {
  const { profile } = usePlayer();

  const recent = (profile.recentlyPlayed || [])
    .map((id) => getGameById(id))
    .filter(Boolean);

  const favourites = (profile.favourites || [])
    .map((id) => getGameById(id))
    .filter(Boolean);

  const uniquePlayed = (profile.uniqueGames || [])
    .map((id) => getGameById(id))
    .filter(Boolean);

  return (
    <div className="library">
      <section className="library__header">
        <div>
          <p className="section-eyebrow">YOUR GAMING HISTORY</p>
          <h1 className="section-title">My Library</h1>
        </div>
        <div className="library__summary">
          <span><BookOpen size={14} /> {uniquePlayed.length} games explored</span>
          <span><Clock size={14} /> {formatPlaytime(profile.playtimeSeconds || 0)} playtime</span>
          <span><Heart size={14} /> {favourites.length} favourites</span>
        </div>
      </section>

      {/* Recently Played */}
      {recent.length > 0 ? (
        <section className="library__section">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">PICK UP WHERE YOU LEFT OFF</p>
              <h2 className="section-title">Recently Played</h2>
            </div>
          </div>
          <div className="library__grid">
            {recent.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      ) : (
        <div className="library__empty">
          <span>🎮</span>
          <h3>No games played yet</h3>
          <p>Start playing to build your library.</p>
          <Link to="/explore" className="library__cta">Browse Games</Link>
        </div>
      )}

      {/* Favourites */}
      {favourites.length > 0 && (
        <section className="library__section">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">YOUR SAVED GAMES</p>
              <h2 className="section-title">Favourites</h2>
            </div>
          </div>
          <div className="library__grid">
            {favourites.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      {/* All played games */}
      {uniquePlayed.length > 0 && (
        <section className="library__section">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">EXPLORED TITLES</p>
              <h2 className="section-title">Played Games</h2>
            </div>
          </div>
          <div className="library__grid">
            {uniquePlayed.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}
    </div>
  );
}
