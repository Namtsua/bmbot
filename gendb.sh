#!/bin/bash

mkdir -p db

rm -f ./db/users.db

sqlite3 ./db/users.db <<EOS
	CREATE TABLE users (
	user_id text PRIMARY KEY,
	username text NOT NULL,
	discriminator integer,
	ingame integer NOT NULL,
	isBM integer NOT NULL
	);

	CREATE TABLE connections (
	type text NOT NULL,
	name text NOT NULL,
	id text NOT NULL,
	user_id text NOT NULL,
	
	CONSTRAINT fk_users
		FOREIGN KEY(user_id) 
		REFERENCES users(user_id)
		ON DELETE CASCADE
	);

EOS
