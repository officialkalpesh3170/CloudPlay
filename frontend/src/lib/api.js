/**
 * CloudPlay API Service Client
 *
 * Connects frontend state to FastAPI backend (running on port 8000).
 * Provides graceful fallbacks so the frontend runs offline or standalone
 * even if the FastAPI backend is not yet started.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
import { auth } from "./firebase";
/**
 * Health check for FastAPI backend
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: "offline", error: err.message };
  }
}

/**
 * Register or fetch user from FastAPI backend
 * @param {string} username
 * @param {string} email
 */
export async function registerBackendUser(username, email) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    });

    if (res.status === 409) {
      return { success: false, conflict: true, message: "User already registered" };
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Get all registered users from Firestore via FastAPI
 */
export async function getBackendUsers() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { total_users: 0, users: [], error: err.message };
  }
}

/**
 * Initialize or retrieve authenticated player's Firestore profile.
 */
export async function ensureBackendProfile(user) {
  try {
    if (!user) {
      throw new Error("User is not authenticated");
    }

    const idToken = await user.getIdToken();

    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || `HTTP ${res.status}`);
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}


/**
 * Sync player progression (XP, coins, high score) to FastAPI / Firestore
 * @param {string} userId
 * @param {object} profileData
 */

/**
 * Sync authenticated player's progression to FastAPI / Firestore
 */
export async function syncPlayerProfile(userId, profileData) {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return {
        synced: false,
        error: "User is not authenticated",
      };
    }
    

    const idToken = await currentUser.getIdToken();

    const res = await fetch(`${API_BASE_URL}/api/users/${userId}/sync`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return {
      synced: true,
      data: await res.json(),
    };
  } catch (err) {
    return {
      synced: false,
      error: err.message,
    };
  }
}
