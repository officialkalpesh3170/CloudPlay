import { Link } from "react-router-dom";
import { Play, Heart, Star, Zap } from "lucide-react";
import { usePlayer } from "../context/usePlayer";
import "../styles/gamecard.css";

export default function GameCard({ game, size = "default" }) {
  const { profile, toggleFavourite } = usePlayer();
  const isFav = (profile.favourites || []).includes(game.id);

  return (
    <article className={`game-card game-card--${size}`}>
      <div className="game-card__image">
        <img src={game.cover} alt={`${game.title} cover art`} loading="lazy" />

        {/* Badges */}
        <div className="game-card__badges">
          {game.new     && <span className="game-badge game-badge--new">NEW</span>}
          {game.featured && <span className="game-badge game-badge--featured"><Star size={9} fill="currentColor" /> FEATURED</span>}
          {game.trending && !game.featured && !game.new && (
            <span className="game-badge game-badge--trending"><Zap size={9} fill="currentColor" /> HOT</span>
          )}
        </div>

        {/* Favourite button */}
        <button
          className={`game-card__fav ${isFav ? "game-card__fav--active" : ""}`}
          onClick={(e) => { e.preventDefault(); toggleFavourite(game.id); }}
          aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
        >
          <Heart size={14} fill={isFav ? "currentColor" : "none"} />
        </button>

        {/* Hover overlay */}
        <div className="game-card__overlay">
          <Link to={`/play/${game.id}`} className="game-card__play-btn">
            <Play size={18} fill="currentColor" />
            Play Now
          </Link>
        </div>
      </div>

      <div className="game-card__body">
        <div className="game-card__meta">
          <span className="game-card__category">{game.category}</span>
          <span className="game-card__rating">
            <Star size={10} fill="currentColor" /> {game.rating}
          </span>
        </div>
        <h3 className="game-card__title">{game.title}</h3>
        <p className="game-card__desc">{game.description}</p>
        <div className="game-card__footer">
          <span className="game-card__tag">{game.players}</span>
          <span className="game-card__tag">{game.controls}</span>
        </div>
      </div>
    </article>
  );
}
