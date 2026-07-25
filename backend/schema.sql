CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'staff') NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  category_sinhala VARCHAR(100),
  size VARCHAR(50) NOT NULL,
  invoice VARCHAR(100),
  expiry DATE,
  received INT NOT NULL DEFAULT 0,
  balance INT NOT NULL DEFAULT 0,
  minimum_stock INT NOT NULL DEFAULT 5,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_product_variant
    UNIQUE (category, name, size)
);

CREATE TABLE IF NOT EXISTS activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(50) NOT NULL,
  product_id INT,
  product_name VARCHAR(150),
  size VARCHAR(50),
  quantity INT NOT NULL DEFAULT 0,
  balance INT,
  message VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_activity_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_products_category
  ON products(category);

CREATE INDEX idx_products_name
  ON products(name);

CREATE INDEX idx_activities_created_at
  ON activities(created_at);