/**
 * Explore page — searchable, filterable game catalog.
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { filterGames, GAME_CATEGORIES, games } from "../lib/catalog";
import GameCard from "../components/GameCard";
import "../styles/explore.css";

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "rating",  label: "Rating" },
  { value: "alpha",   label: "A–Z" },
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search,   setSearch]   = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("cat") || "All");
  const [sort,     setSort]     = useState("default");
  const [showFilters, setShowFilters] = useState(false);

  // Update URL when search/category changes
  useEffect(() => {
    const params = {};
    if (search)           params.q   = search;
    if (category !== "All") params.cat = category;
    setSearchParams(params, { replace: true });
  }, [search, category, setSearchParams]);

  let results = filterGames({ category, search });

  if (sort === "rating") results = [...results].sort((a, b) => b.rating - a.rating);
  if (sort === "alpha")  results = [...results].sort((a, b) => a.title.localeCompare(b.title));

  const clearFilters = () => { setSearch(""); setCategory("All"); setSort("default"); };
  const hasFilters = search || category !== "All" || sort !== "default";

  return (
    <div className="explore">

      <section className="explore__header">
        <div>
          <p className="section-eyebrow">CLOUDPLAY ARCADE</p>
          <h1 className="section-title explore__title">Explore Games</h1>
          <p className="explore__sub">
            {games.length} games ready to play — no download, no install.
          </p>
        </div>
      </section>

      {/* ── Controls ─────────────────────────────────────────────────── */}
      <div className="explore__controls">
        <div className="explore__search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by title, category or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search games"
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search">
              <X size={15} />
            </button>
          )}
        </div>

        <button
          className={`explore__filter-toggle ${showFilters ? "explore__filter-toggle--active" : ""}`}
          onClick={() => setShowFilters((s) => !s)}
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>

        <select
          className="explore__sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort games"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasFilters && (
          <button className="explore__clear" onClick={clearFilters}>
            <X size={13} /> Clear filters
          </button>
        )}
      </div>

      {/* ── Category pills ────────────────────────────────────────────── */}
      <div className={`explore__categories ${showFilters ? "explore__categories--visible" : ""}`}>
        {GAME_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`explore__cat-pill ${category === cat ? "explore__cat-pill--active" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Results ──────────────────────────────────────────────────── */}
      <div className="explore__results-bar">
        <span>{results.length} game{results.length !== 1 ? "s" : ""}</span>
        {category !== "All" && <span className="explore__active-filter">{category}</span>}
        {search && <span className="explore__active-filter">"{search}"</span>}
      </div>

      {results.length > 0 ? (
        <div className="explore__grid">
          {results.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      ) : (
        <div className="explore__empty">
          <span>🔍</span>
          <h3>No games found</h3>
          <p>Try a different search term or clear your filters.</p>
          <button onClick={clearFilters} className="explore__clear-btn">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
