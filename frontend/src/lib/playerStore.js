/**
 * CloudPlay Player Store
 * Manages all local player data: profile, progress, achievements, favourites.
 * Uses localStorage for persistence — no auth/backend required.
 */

const STORE_KEY = "cloudplay.v2.player";

export const AVATARS = [
  { id: "fox",     emoji: "🦊" },
  { id: "panda",   emoji: "🐼" },
  { id: "tiger",   emoji: "🐯" },
  { id: "frog",    emoji: "🐸" },
  { id: "dragon",  emoji: "🐲" },
  { id: "lion",    emoji: "🦁" },
  { id: "wolf",    emoji: "🐺" },
  { id: "robot",   emoji: "🤖" },
  { id: "alien",   emoji: "👾" },
  { id: "rocket",  emoji: "🚀" },
  { id: "bolt",    emoji: "⚡" },
  { id: "joystick",emoji: "🎮" },
  { id: "skull",   emoji: "💀" },
  { id: "cat",     emoji: "🐱" },
  { id: "bear",    emoji: "🐻" },
  { id: "ninja",   emoji: "🥷" },
];

export const ACHIEVEMENTS = [
  {
    id: "first-play",
    title: "First Steps",
    description: "Launch your first game.",
    icon: "🎮",
    xpReward: 50,
    requirement: (p) => p.totalPlays >= 1,
  },
  {
    id: "five-plays",
    title: "Getting Hooked",
    description: "Play 5 game sessions.",
    icon: "🔥",
    xpReward: 100,
    requirement: (p) => p.totalPlays >= 5,
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Try 3 different games.",
    icon: "🧭",
    xpReward: 150,
    requirement: (p) => p.uniqueGames.length >= 3,
  },
  {
    id: "collector",
    title: "Collector",
    description: "Try 6 different games.",
    icon: "💎",
    xpReward: 250,
    requirement: (p) => p.uniqueGames.length >= 6,
  },
  {
    id: "ten-plays",
    title: "Arcade Regular",
    description: "Play 10 game sessions.",
    icon: "🏆",
    xpReward: 200,
    requirement: (p) => p.totalPlays >= 10,
  },
  {
    id: "twenty-five-plays",
    title: "Dedicated Gamer",
    description: "Play 25 game sessions.",
    icon: "🌟",
    xpReward: 400,
    requirement: (p) => p.totalPlays >= 25,
  },
  {
    id: "favourites",
    title: "Curator",
    description: "Favourite 3 games.",
    icon: "❤️",
    xpReward: 100,
    requirement: (p) => (p.favourites || []).length >= 3,
  },
  {
    id: "level-5",
    title: "Rising Star",
    description: "Reach player level 5.",
    icon: "⭐",
    xpReward: 300,
    requirement: (p) => getPlayerLevel(p.xp) >= 5,
  },
  {
    id: "level-10",
    title: "Veteran Gamer",
    description: "Reach player level 10.",
    icon: "🏅",
    xpReward: 500,
    requirement: (p) => getPlayerLevel(p.xp) >= 10,
  },
];

export const DEFAULT_PROFILE = {
  name: "CyberRider",
  avatarId: "fox",
  xp: 1250,
  coins: 750,
  totalPlays: 14,
  uniqueGames: ["temple-run", "hill-climb", "cyber-2048", "ludo-royale", "neon-velocity"],
  favourites: ["temple-run", "neon-velocity", "cyber-2048"],
  recentlyPlayed: ["neon-velocity", "temple-run", "hill-climb", "cyber-2048"],
  achievements: ["first-play", "speed-demon", "coin-collector", "level-5"],
  playtimeSeconds: 3840,
  createdAt: Date.now() - 86400000 * 5,
};

export function loadProfile() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw);
    // If previous profile was empty default (0 xp or null name), populate with active default stats
    if ((!parsed.xp || parsed.xp === 0) && (!parsed.name || parsed.name === "Guest")) {
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        name: parsed.name && parsed.name !== "Guest" ? parsed.name : DEFAULT_PROFILE.name,
        xp: 1250,
        coins: 750,
        achievements: DEFAULT_PROFILE.achievements,
      };
    }
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn("CloudPlay: could not persist player profile.", err);
  }
}

export function getPlayerLevel(xp) {
  // 100 XP per level, soft-exponential scaling
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function getXpToNextLevel(xp) {
  const level = getPlayerLevel(xp);
  const xpForNextLevel = Math.pow(level, 2) * 50;
  return xpForNextLevel - xp;
}

export function getLevelProgress(xp) {
  const level = getPlayerLevel(xp);
  const xpForCurrentLevel = Math.pow(level - 1, 2) * 50;
  const xpForNextLevel = Math.pow(level, 2) * 50;
  const range = xpForNextLevel - xpForCurrentLevel;
  return ((xp - xpForCurrentLevel) / range) * 100;
}

export function formatPlaytime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${seconds}s`;
}

/**
 * Record a game play session and unlock achievements.
 * Returns { profile, newAchievements }
 */
export function recordGamePlay(profile, gameId) {
  const now = Date.now();
  const isNew = !profile.uniqueGames.includes(gameId);

  const updated = {
    ...profile,
    totalPlays: profile.totalPlays + 1,
    coins: profile.coins + 10,
    xp: profile.xp + 25,
    uniqueGames: isNew
      ? [...profile.uniqueGames, gameId]
      : profile.uniqueGames,
    recentlyPlayed: [
      gameId,
      ...(profile.recentlyPlayed || []).filter((id) => id !== gameId),
    ].slice(0, 8),
    lastPlayedAt: now,
  };

  // Check for newly unlocked achievements
  const already = new Set(profile.achievements);
  const newAchievements = ACHIEVEMENTS.filter(
    (a) => !already.has(a.id) && a.requirement(updated)
  );

  // Award XP for achievements
  const achievementXp = newAchievements.reduce((sum, a) => sum + (a.xpReward || 0), 0);

  updated.achievements = [
    ...profile.achievements,
    ...newAchievements.map((a) => a.id),
  ];
  updated.xp += achievementXp;

  return { profile: updated, newAchievements };
}

export function toggleFavourite(profile, gameId) {
  const favs = profile.favourites || [];
  const isFav = favs.includes(gameId);
  const favourites = isFav
    ? favs.filter((id) => id !== gameId)
    : [...favs, gameId];

  const updated = { ...profile, favourites };

  // Check favourite-related achievements
  const already = new Set(profile.achievements);
  const newAchievements = ACHIEVEMENTS.filter(
    (a) => !already.has(a.id) && a.requirement(updated)
  );
  const achievementXp = newAchievements.reduce((sum, a) => sum + (a.xpReward || 0), 0);

  updated.achievements = [
    ...profile.achievements,
    ...newAchievements.map((a) => a.id),
  ];
  updated.xp += achievementXp;

  return { profile: updated, newAchievements };
}

export function getAvatarEmoji(avatarId) {
  return AVATARS.find((a) => a.id === avatarId)?.emoji ?? "🎮";
}
