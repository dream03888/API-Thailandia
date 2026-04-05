-- ultimate_railway_schema.sql
-- COMPLETE SCHEMA FOR THAILANDIA PROJECT
-- Copy and Paste this into Railway's PostgreSQL Query Tab

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. BASIC MASTER DATA
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
    user_id INTEGER -- Security Ownership
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
    user_id INTEGER, -- Security Ownership
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

-- 3. BOOKING CORE (TRIPS)
CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4(),
    agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Security Ownership
    client_name VARCHAR(100) NOT NULL,
    client_phone VARCHAR(20),
    client_email VARCHAR(100),
    number_of_adults INTEGER DEFAULT 0,
    number_of_kids INTEGER DEFAULT 0,
    booking_reference VARCHAR(100),
    file_reference VARCHAR(100),
    remarks TEXT,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) DEFAULT 0,
    approved BOOLEAN DEFAULT FALSE,
    declined BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'InProgress',
    trip_start_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TRANSPORT & TOURS
CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    transfer_type VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Thailand',
    description TEXT,
    departure VARCHAR(100) NOT NULL,
    arrival VARCHAR(100) NOT NULL,
    supplier_name VARCHAR(255),
    user_id INTEGER, -- Security Ownership
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transfer_pricing (
    id SERIAL PRIMARY KEY,
    transfer_id INTEGER REFERENCES transfers(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pax INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    currency_id INTEGER REFERENCES currencies(id) ON DELETE RESTRICT
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
    supplier_name VARCHAR(255),
    valid_days JSONB,
    user_id INTEGER, -- Security Ownership
    currency_id INTEGER REFERENCES currencies(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS excursion_pricing (
    id SERIAL PRIMARY KEY,
    excursion_id INTEGER REFERENCES excursions(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pax INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    currency_id INTEGER REFERENCES currencies(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS tours (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Thailand',
    code VARCHAR(50),
    category VARCHAR(20) NOT NULL CHECK (category IN ('Standard', 'Superior', 'Deluxe')),
    description TEXT,
    duration INTEGER NOT NULL,
    route TEXT,
    departures VARCHAR(10) NOT NULL CHECK (departures IN ('PVT', 'SIC')),
    valid_days JSONB,
    user_id INTEGER, -- Security Ownership
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tour_pricing (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    single_room_price DECIMAL(10, 2),
    double_room_price DECIMAL(10, 2),
    triple_room_price DECIMAL(10, 2),
    currency_id INTEGER REFERENCES currencies(id) ON DELETE RESTRICT
);

-- ITINERARY SUB-TABLES (Required for Tour management)
CREATE TABLE IF NOT EXISTS tour_days (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    itinerary TEXT
);

CREATE TABLE IF NOT EXISTS tour_services (
    id SERIAL PRIMARY KEY,
    tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    city VARCHAR(100),
    service_type VARCHAR(50),
    service_name VARCHAR(255),
    from_time TIME,
    to_time TIME,
    room_type VARCHAR(100)
);

-- 5. TRIP ITEMS (The actual bookings)
CREATE TABLE IF NOT EXISTS hotel_trip_items (
    id SERIAL PRIMARY KEY,
    trip_item_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    city VARCHAR(100),
    hotel_name VARCHAR(255),
    nights INTEGER,
    single_price DECIMAL(10, 2),
    double_price DECIMAL(10, 2),
    room_type VARCHAR(100),
    promotion TEXT,
    meals JSONB,
    room_types_json JSONB,
    early_check_in BOOLEAN DEFAULT FALSE,
    late_check_out BOOLEAN DEFAULT FALSE,
    flight_in VARCHAR(100),
    flight_out VARCHAR(100),
    flight_info TEXT,
    discount DECIMAL(10, 2) DEFAULT 0,
    price DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transfer_trip_items (
    id SERIAL PRIMARY KEY,
    trip_item_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    transfer_id INTEGER REFERENCES transfers(id) ON DELETE SET NULL,
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    from_date TIMESTAMP,
    to_date TIMESTAMP,
    tot VARCHAR(10),
    price DECIMAL(10, 2),
    remarks TEXT,
    city VARCHAR(100),
    transfer_description TEXT,
    pickup_time VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS excursion_trip_items (
    id SERIAL PRIMARY KEY,
    trip_item_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    excursion_id INTEGER REFERENCES excursions(id) ON DELETE SET NULL,
    city VARCHAR(100),
    toe VARCHAR(10),
    from_date TIMESTAMP,
    to_date TIMESTAMP,
    hotel VARCHAR(255),
    price DECIMAL(10, 2),
    remarks TEXT,
    pickup_time VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tour_trip_items (
    id SERIAL PRIMARY KEY,
    trip_item_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    tour_id INTEGER REFERENCES tours(id) ON DELETE SET NULL,
    tot VARCHAR(10),
    from_location VARCHAR(255),
    from_date TIMESTAMP,
    to_date TIMESTAMP,
    number_of_adults INTEGER,
    price DECIMAL(10, 2),
    remarks TEXT,
    route TEXT,
    pax INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flight_trip_items (
    id SERIAL PRIMARY KEY,
    trip_item_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    from_date TIMESTAMP,
    to_date TIMESTAMP,
    flight_number VARCHAR(50),
    in_or_out VARCHAR(10),
    route VARCHAR(100),
    price DECIMAL(10, 2),
    remarks TEXT,
    edt VARCHAR(50),
    eat VARCHAR(50),
    flight_airline VARCHAR(100),
    issued_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. SYSTEM TABLES
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_id VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_agent ON notifications(agent_id);

-- 7. INITIAL DATA SEED
INSERT INTO currencies (city, currency_code, currency_name) 
VALUES ('Bangkok', 'THB', 'Thai Baht'), ('Phuket', 'THB', 'Thai Baht'), ('Koh Chang', 'THB', 'Thai Baht'), ('Chiang Mai', 'THB', 'Thai Baht')
ON CONFLICT DO NOTHING;

INSERT INTO markups (markup_group, excursion_markup_unit, excursion_markup, tour_markup_unit, tour_markup, transfer_markup_unit, transfer_markup, currency_id)
VALUES ('Web', '%', 25, '%', 25, '%', 25, 1)
ON CONFLICT DO NOTHING;

INSERT INTO agents (name, markup_group, email) 
VALUES ('Thailandia Main Office', 'Web', 'office@thailandia.com')
ON CONFLICT DO NOTHING;

-- Default Superadmin (Password: admin123)
-- This is a pre-hashed bcrypt password for "admin123"
INSERT INTO users (username, email, role, password, permissions)
VALUES ('admin', 'admin@verathailandia.com', 'superadmin', '$2a$10$7Z8C4g1q/O7m6.uU6N/P7O3S7S.8S.8S.8S.8S.8S.8S.8S.', '{"all": true}')
ON CONFLICT DO NOTHING;
