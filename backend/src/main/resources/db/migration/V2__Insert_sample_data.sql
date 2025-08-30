-- Insert sample categories
INSERT INTO categories (id, name, description) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Electronics', 'Electronic devices and accessories'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Clothing', 'Fashion and apparel'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Books', 'Books and educational materials'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Home & Garden', 'Home improvement and garden supplies'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Sports', 'Sports equipment and accessories');

-- Insert sample products
INSERT INTO products (id, name, description, price, stock_quantity, category_id, sku, image_url, weight) VALUES 
    ('660e8400-e29b-41d4-a716-446655440001', 'Smartphone Pro Max', 'Latest flagship smartphone with advanced features', 999.99, 50, '550e8400-e29b-41d4-a716-446655440001', 'PHONE-001', 'https://example.com/phone.jpg', 0.200),
    ('660e8400-e29b-41d4-a716-446655440002', 'Wireless Headphones', 'Premium noise-cancelling wireless headphones', 299.99, 100, '550e8400-e29b-41d4-a716-446655440001', 'HEAD-001', 'https://example.com/headphones.jpg', 0.300),
    ('660e8400-e29b-41d4-a716-446655440003', 'Cotton T-Shirt', 'Comfortable 100% cotton t-shirt', 29.99, 200, '550e8400-e29b-41d4-a716-446655440002', 'SHIRT-001', 'https://example.com/tshirt.jpg', 0.150),
    ('660e8400-e29b-41d4-a716-446655440004', 'Programming Book', 'Complete guide to modern programming', 49.99, 75, '550e8400-e29b-41d4-a716-446655440003', 'BOOK-001', 'https://example.com/book.jpg', 0.500),
    ('660e8400-e29b-41d4-a716-446655440005', 'Coffee Maker', 'Automatic drip coffee maker', 89.99, 30, '550e8400-e29b-41d4-a716-446655440004', 'COFFEE-001', 'https://example.com/coffee.jpg', 2.500),
    ('660e8400-e29b-41d4-a716-446655440006', 'Running Shoes', 'Professional running shoes for athletes', 129.99, 80, '550e8400-e29b-41d4-a716-446655440005', 'SHOES-001', 'https://example.com/shoes.jpg', 0.800),
    ('660e8400-e29b-41d4-a716-446655440007', 'Laptop Computer', 'High-performance laptop for professionals', 1299.99, 25, '550e8400-e29b-41d4-a716-446655440001', 'LAPTOP-001', 'https://example.com/laptop.jpg', 2.200),
    ('660e8400-e29b-41d4-a716-446655440008', 'Jeans', 'Classic blue denim jeans', 79.99, 150, '550e8400-e29b-41d4-a716-446655440002', 'JEANS-001', 'https://example.com/jeans.jpg', 0.600);

-- Insert sample admin user (password: admin123)
INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES 
    ('770e8400-e29b-41d4-a716-446655440001', 'admin@shopping.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Admin', 'User', 'ADMIN');

-- Insert sample customer user (password: customer123)
INSERT INTO users (id, email, password_hash, first_name, last_name, phone) VALUES 
    ('770e8400-e29b-41d4-a716-446655440002', 'customer@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'John', 'Doe', '+1234567890');
