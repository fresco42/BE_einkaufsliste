-- Datenbank erstellen
CREATE DATABASE IF NOT EXISTS shopping_list;
USE shopping_list;

-- Users Tabelle
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lists Tabelle
CREATE TABLE IF NOT EXISTS lists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Items Tabelle
CREATE TABLE IF NOT EXISTS items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    checked BOOLEAN NOT NULL DEFAULT FALSE,
    list_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
);

-- Indizes für bessere Performance
CREATE INDEX idx_lists_user_id ON lists(user_id);
CREATE INDEX idx_items_list_id ON items(list_id);

-- Optionale Test-Daten
-- INSERT INTO users (username, password) VALUES ('testuser', 'password123');
-- INSERT INTO lists (name, user_id) VALUES ('Meine Einkaufsliste', 1);
-- INSERT INTO items (name, quantity, list_id) VALUES ('Milch', 2, 1);
-- INSERT INTO items (name, quantity, list_id) VALUES ('Brot', 1, 1);
