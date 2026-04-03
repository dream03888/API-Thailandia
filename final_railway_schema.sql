-- final_railway_schema.sql
-- Combined schema for Thailandia Project

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Master Data & Security Base
CREATE TABLE IF NOT EXISTS currencies (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) UNIQUE NOT NULL,
    currency_code VARCHAR(10) NOT NULL,
    currency_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    markup_group VARCHAR(20) NOT NULL,
    address TEXT,
    email VARCHAR(100) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    fax VARCHAR(20),
    user_id INTEGER -- Security Ownership Column
);

CREATE TABLE IF NOT EXISTS markups (
    id SERIAL PRIMARY KEY,
    markup_group VARCHAR(20) NOT NULL,
    excursion_markup_unit VARCHAR(10) NOT NULL CHECK (excursion_markup_unit IN ('flat rate', '%')),
    excursion_markup DECIMAL(10, 2) NOT NULL,
    tour_markup_unit VARCHAR(10) NOT NULL CHECK (tour_markup_unit IN ('flat rate', '%')),
    tour_markup DECIMAL(10, 2) NOT NULL,
    transfer_markup_unit VARCHAR(10) NOT NULL CHECK (transfer_markup_unit IN ('flat rate', '%')),
    transfer_markup DECIMAL(10, 2) NOT NULL,
    currency_id INTEGER REFERENCES currencies(id) ON DELETE RESTRICT,
    CONSTRAINT unique_markup_group UNIQUE (markup_group)
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('agent', 'admin', 'user', 'superadmin')),
    password VARCHAR(100) NOT NULL,
    agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Thailand',
    notes TEXT,
    address VARCHAR(255),
    user_id INTEGER, -- Security Ownership Column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    email VARCHAR(100),
    telephone VARCHAR(20),
    location VARCHAR(255),
    offers_transfers BOOLEAN DEFAULT FALSE,
    offers_excursions BOOLEAN DEFAULT FALSE,
    offers_tours BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4(),
    agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Security Ownership Column
    client_name VARCHAR(100) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    number_of_adults INTEGER NOT NULL,
    number_of_kids INTEGER NOT NULL,
    booking_reference VARCHAR(100),
    file_reference VARCHAR(100),
    remarks TEXT,
    total_amount DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2),
    final_amount DECIMAL(10, 2),
    approved BOOLEAN DEFAULT FALSE,
    declined BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'InProgress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    transfer_type VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Thailand',
    description TEXT,
    departure VARCHAR(100) NOT NULL,
    arrival VARCHAR(100) NOT NULL,
    user_id INTEGER, -- Security Ownership Column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS excursions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Thailand',
    code VARCHAR(50),
    is_sic_excursion BOOLEAN DEFAULT FALSE,
    description TEXT,
    sic_price_adult DECIMAL(10, 2),
    sic_price_child DECIMAL(10, 2),
    walkin_price DECIMAL(10, 2),
    user_id INTEGER, -- Security Ownership Column
    currency_id INTEGER REFERENCES currencies(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tours (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Thailand',
    code VARCHAR(50),
    category VARCHAR(20) NOT NULL CHECK (category IN ('Standard', 'Superior', 'Deluxe')),
    description TEXT,
    duration INTEGER NOT NULL,
    route TEXT,
    departures VARCHAR(10) NOT NULL CHECK (departures IN ('PVT', 'SIC')),
    user_id INTEGER, -- Security Ownership Column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_id VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- 4. Initial Seed Data
INSERT INTO currencies (city, currency_code, currency_name) 
VALUES ('Bangkok', 'THB', 'Thai Baht'), ('Phuket', 'THB', 'Thai Baht'), ('Koh Chang', 'THB', 'Thai Baht')
ON CONFLICT DO NOTHING;

INSERT INTO agents (name, markup_group, email) 
VALUES ('Vera Thailandia Online', 'Web', 'admin@verathailandia.com')
ON CONFLICT DO NOTHING;

-- Default Superadmin (Password: admin123)
INSERT INTO users (username, email, role, password, permissions)
VALUES ('admin', 'admin@verathailandia.com', 'superadmin', '$2a$10$7Z8C4g1q/O7m6.uU6N/P7O3S7S.8S.8S.8S.8S.8S.8S.8S.', '{"all": true}')
ON CONFLICT DO NOTHING;
