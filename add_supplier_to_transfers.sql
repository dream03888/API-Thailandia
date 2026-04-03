ALTER TABLE transfers ADD COLUMN supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL;
ALTER TABLE transfers ADD COLUMN supplier_name VARCHAR(100); -- Keeping this just in case, but we prefer ID
