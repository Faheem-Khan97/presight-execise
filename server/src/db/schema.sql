CREATE TABLE IF NOT EXISTS nationalities (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  avatar TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  nationality_id INTEGER NOT NULL REFERENCES nationalities(id)
);

CREATE TABLE IF NOT EXISTS hobbies (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_hobbies (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hobby_id INTEGER NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, hobby_id)
);

CREATE INDEX IF NOT EXISTS idx_users_nationality_id ON users(nationality_id);
CREATE INDEX IF NOT EXISTS idx_users_age ON users(age);
CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
CREATE INDEX IF NOT EXISTS idx_user_hobbies_hobby ON user_hobbies(hobby_id, user_id);
