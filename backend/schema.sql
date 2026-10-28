-- SQLite tabulu struktura. Datus izveido lietotne, nevis sis fails.
PRAGMA foreign_keys=ON;


CREATE TABLE categories (
	id INTEGER NOT NULL,
	name VARCHAR(80) NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (name)
);

CREATE TABLE users (
	id INTEGER NOT NULL,
	email VARCHAR(320) NOT NULL,
	password_hash VARCHAR(255),
	display_name VARCHAR(80) NOT NULL,
	role VARCHAR(20) NOT NULL,
	created_at DATETIME NOT NULL,
	PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE TABLE decks (
	id INTEGER NOT NULL,
	owner_id INTEGER NOT NULL,
	title VARCHAR(60) NOT NULL,
	description TEXT,
	category VARCHAR(80),
	language VARCHAR(10) NOT NULL,
	is_public BOOLEAN NOT NULL,
	created_at DATETIME NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY(owner_id) REFERENCES users (id)
);

CREATE TABLE scores (
	user_id INTEGER NOT NULL,
	total_rp INTEGER NOT NULL,
	week_rp INTEGER NOT NULL,
	week_start DATETIME,
	streak_days INTEGER NOT NULL,
	last_study_date DATETIME,
	league VARCHAR(30) NOT NULL,
	PRIMARY KEY (user_id),
	FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE cards (
	id INTEGER NOT NULL,
	deck_id INTEGER NOT NULL,
	front TEXT NOT NULL,
	back TEXT NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY(deck_id) REFERENCES decks (id)
);

CREATE TABLE reports (
	id INTEGER NOT NULL,
	deck_id INTEGER NOT NULL,
	reporter_id INTEGER NOT NULL,
	reason TEXT NOT NULL,
	status VARCHAR(20) NOT NULL,
	created_at DATETIME NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY(deck_id) REFERENCES decks (id),
	FOREIGN KEY(reporter_id) REFERENCES users (id)
);

CREATE TABLE reviews (
	id INTEGER NOT NULL,
	user_id INTEGER NOT NULL,
	card_id INTEGER NOT NULL,
	reviewed_at DATETIME NOT NULL,
	rating INTEGER NOT NULL,
	next_review_at DATETIME,
	interval INTEGER NOT NULL,
	ease_factor FLOAT NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY(user_id) REFERENCES users (id),
	FOREIGN KEY(card_id) REFERENCES cards (id)
);
