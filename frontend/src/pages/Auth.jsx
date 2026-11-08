import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { login, logout, register } from "../lib/auth";

export default function Auth() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      if (mode === "signup") {
        await register(email, password);
        setMessage("Account created and signed in.");
      } else {
        await login(email, password);
        setMessage("Logged in successfully.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setMessage("");

    try {
      await logout();
      setMessage("Logged out.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  function toggleMode() {
    setMode((currentMode) =>
      currentMode === "signup" ? "login" : "signup"
    );
    setMessage("");
  }

  return (
  <main className="auth-page">
    <section
      className="auth-card"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
          "--glow-x",
          `${event.clientX - rect.left}px`
        );
        event.currentTarget.style.setProperty(
          "--glow-y",
          `${event.clientY - rect.top}px`
        );
      }}
    >
      <h1 className="auth-title">CloudPlay Account</h1>

      {user ? (
        <>
          <p>Signed in as: {user.email}</p>
          <button
            className="auth-submit"
            type="button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <h2 className="auth-heading">
            {mode === "signup" ? "Create account" : "Log in"}
          </h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              Email
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label className="auth-field">
              Password
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
              />
            </label>

            <button
              className="auth-submit"
              type="submit"
              disabled={busy}
            >
              {busy
                ? "Please wait..."
                : mode === "signup"
                  ? "Sign up"
                  : "Log in"}
            </button>
          </form>

          <p>
            {mode === "signup"
              ? "Already have an account?"
              : "New to CloudPlay?"}{" "}
            <button
              className="auth-switch"
              type="button"
              onClick={toggleMode}
            >
              {mode === "signup" ? "Log in" : "Create account"}
            </button>
          </p>
        </>
      )}

      {message && <p role="status">{message}</p>}
    </section>
  </main>
);
}
