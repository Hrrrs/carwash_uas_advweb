-- ===========================================
-- DATABASE SCHEMA FOR ANGIN MAMIRI
-- Car Wash & Cafe Web Application
-- ===========================================

-- Reset Tables
DROP TABLE IF EXISTS transaction_details;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- 1. USERS (Authentication)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PRODUCTS (Master Data)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('service', 'food', 'beverage') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TRANSACTIONS (Header)
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    police_number VARCHAR(20), -- Key Identifier
    total_amount DECIMAL(10, 2) DEFAULT 0,
    status ENUM('pending', 'paid') DEFAULT 'pending', 
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. TRANSACTION DETAILS
CREATE TABLE transaction_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    qty INT DEFAULT 1,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ===========================================
-- SEED DATA
-- ===========================================

-- Default Admin User (password: admin123)
-- Password hash generated with bcrypt
INSERT INTO users (username, password, role) VALUES 
('admin', '$2a$10$X7UrE5zP3D8g1iJt5HkwOeRmf0A3vN6yB4cK9wL2mQ8nZ7sT1xYzC', 'admin');

-- Sample Products - Services
INSERT INTO products (name, category, price, description) VALUES
('Cuci Motor Standard', 'service', 15000, 'Cuci motor dengan sabun khusus'),
('Cuci Motor Premium', 'service', 25000, 'Cuci motor + semir ban + poles body'),
('Cuci Mobil Standard', 'service', 35000, 'Cuci mobil exterior'),
('Cuci Mobil Premium', 'service', 55000, 'Cuci mobil + interior + semir ban + poles'),
('Cuci Mobil Complete', 'service', 75000, 'Full service: exterior, interior, engine, poles');

-- Sample Products - Foods
INSERT INTO products (name, category, price, description) VALUES
('Nasi Goreng Special', 'food', 20000, 'Nasi goreng dengan telur dan ayam'),
('Mie Goreng', 'food', 18000, 'Mie goreng dengan sayuran'),
('Ayam Geprek', 'food', 22000, 'Ayam geprek sambal level 1-5'),
('Kentang Goreng', 'food', 15000, 'French fries crispy'),
('Pisang Goreng', 'food', 12000, 'Pisang goreng keju coklat');

-- Sample Products - Beverages
INSERT INTO products (name, category, price, description) VALUES
('Es Teh Manis', 'beverage', 5000, 'Teh manis dingin segar'),
('Es Jeruk', 'beverage', 8000, 'Jeruk peras segar'),
('Kopi Hitam', 'beverage', 8000, 'Kopi hitam original'),
('Es Kopi Susu', 'beverage', 15000, 'Kopi susu ala cafe'),
('Jus Alpukat', 'beverage', 15000, 'Jus alpukat segar');
