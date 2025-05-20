-- SQL snippet to add a "name" column to the existing events table
ALTER TABLE events ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'New Event';
