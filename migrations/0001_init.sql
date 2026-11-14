CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt          TEXT NOT NULL,
  iterations    INTEGER NOT NULL,
  created_at    INTEGER NOT NULL
);

-- Only the SHA-256 of a session token is stored, so a database leak
-- does not hand out usable sessions.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS favorites (
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id      INTEGER NOT NULL,
  title         TEXT NOT NULL,
  poster_path   TEXT,
  backdrop_path TEXT,
  vote_average  REAL,
  release_date  TEXT,
  added_at      INTEGER NOT NULL,
  PRIMARY KEY (user_id, movie_id)
);

-- Fixed-window counters. Keys are hashed, so no raw IPs or emails are kept.
CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count        INTEGER NOT NULL
);

-- Cookieless, aggregate-only product analytics: one counter per day/event/variant.
CREATE TABLE IF NOT EXISTS events_daily (
  day     TEXT NOT NULL,
  name    TEXT NOT NULL,
  variant TEXT NOT NULL DEFAULT '',
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, name, variant)
);
