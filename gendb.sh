#!/bin/bash

mkdir -p db

sqlite3 ./db/users.db <<EOS
	CREATE TABLE users (
	user_id integer PRIMARY KEY,
	username text NOT NULL,
	discriminator integer
	);
	CREATE TABLE connections (
	type text NOT NULL,
	name text NOT NULL,
	user_id integer NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users(user_id)
	);

EOS
