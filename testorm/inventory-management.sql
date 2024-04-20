-- Create a table for users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20),
    address VARCHAR(255),
    date_registered TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for admins
CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20),
    date_registered TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for inventory items
CREATE TABLE inventory (
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    purchase_date DATE,
    expiration_date DATE,
    user_id INT REFERENCES users(user_id),
    admin_id INT REFERENCES admins(admin_id),
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for transactions
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    transaction_type VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    item_id INT REFERENCES inventory(item_id),
    user_id INT REFERENCES users(user_id),
    admin_id INT REFERENCES admins(admin_id),
    quantity INTEGER NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    notes TEXT
);

-- Create a table for suppliers
CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20),
    address VARCHAR(255)
);

-- Create a table for purchase orders
CREATE TABLE purchase_orders (
    order_id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES suppliers(supplier_id),
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    delivery_date DATE,
    total_amount NUMERIC(12, 2) NOT NULL,
    notes TEXT
);

-- Create a table for order items
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES purchase_orders(order_id),
    item_id INT REFERENCES inventory(item_id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);



-- Create a table for inventory items
CREATE TABLE inventory (
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    purchase_date DATE,
    expiration_date DATE,
    user_id INT,
    admin_id INT,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
);

-- Insert sample data into users table
INSERT INTO users (username, full_name, email, phone_number, address)
VALUES ('john_doe', 'John Doe', 'john@example.com', '1234567890', '123 Main Street');

-- Insert sample data into admins table
INSERT INTO admins (username, full_name, email, phone_number)
VALUES ('admin1', 'Admin One', 'admin1@example.com', '9876543210');

-- Insert sample data into inventory table
INSERT INTO inventory (item_name, description, quantity, unit_price, total_price, purchase_date, expiration_date, user_id, admin_id)
VALUES ('Cash (Local Currency)', 'Various denominations of currency notes and coins', 10000, 100.00, 1000000.00, '2024-03-14', NULL, 1, 1),
       ('Securities', 'Government bonds', 500, 250.00, 125000.00, '2024-03-14', '2025-03-14', 1, 1);

