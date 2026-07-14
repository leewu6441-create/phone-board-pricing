-- ============================================================
-- Phone Motherboard Price List - Initial Schema
-- ============================================================

-- 1. Categories (Apple / Android)
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL,
    slug        VARCHAR(50)  NOT NULL UNIQUE,
    icon        VARCHAR(255),
    sort_order  INT          DEFAULT 0,
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, icon, sort_order) VALUES
    ('Apple', 'apple', '🍎', 1),
    ('Android', 'android', '🤖', 2);

-- 2. Brands
CREATE TABLE brands (
    id          SERIAL PRIMARY KEY,
    category_id INT          NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL,
    logo_url    VARCHAR(255),
    sort_order  INT          DEFAULT 0,
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMPTZ  DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE(category_id, slug)
);

-- Insert default brands
INSERT INTO brands (category_id, name, slug, sort_order) VALUES
    (1, 'iPhone', 'iphone', 1),
    (2, 'Samsung', 'samsung', 1),
    (2, 'Xiaomi', 'xiaomi', 2),
    (2, 'OPPO', 'oppo', 3),
    (2, 'Vivo', 'vivo', 4);

-- 3. Device Models
CREATE TABLE device_models (
    id          SERIAL PRIMARY KEY,
    brand_id    INT          NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    model_code  VARCHAR(100),
    slug        VARCHAR(200) NOT NULL,
    sort_order  INT          DEFAULT 0,
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMPTZ  DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE(brand_id, slug)
);

-- Insert sample models
INSERT INTO device_models (brand_id, name, slug, sort_order) VALUES
    (1, 'iPhone 15 Pro Max', 'iphone-15-pro-max', 1),
    (1, 'iPhone 15 Pro', 'iphone-15-pro', 2),
    (1, 'iPhone 15 Plus', 'iphone-15-plus', 3),
    (1, 'iPhone 15', 'iphone-15', 4),
    (1, 'iPhone 14 Pro Max', 'iphone-14-pro-max', 5),
    (1, 'iPhone 14 Pro', 'iphone-14-pro', 6),
    (1, 'iPhone 14 Plus', 'iphone-14-plus', 7),
    (1, 'iPhone 14', 'iphone-14', 8),
    (2, 'Galaxy S24 Ultra', 'galaxy-s24-ultra', 1),
    (2, 'Galaxy S24+', 'galaxy-s24-plus', 2),
    (2, 'Galaxy S24', 'galaxy-s24', 3),
    (2, 'Galaxy S23 Ultra', 'galaxy-s23-ultra', 4),
    (3, 'Xiaomi 14 Ultra', 'xiaomi-14-ultra', 1),
    (3, 'Xiaomi 14', 'xiaomi-14', 2);

-- 4. Price Entries (Core table)
CREATE TABLE price_entries (
    id              SERIAL PRIMARY KEY,
    device_model_id INT          NOT NULL REFERENCES device_models(id) ON DELETE CASCADE,
    variant         VARCHAR(300) NOT NULL,
    price_vnd       BIGINT       NOT NULL,
    is_active       BOOLEAN      DEFAULT TRUE,
    sort_order      INT          DEFAULT 0,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- Insert sample prices
INSERT INTO price_entries (device_model_id, variant, price_vnd) VALUES
    (1, '256GB | Còn Face ID', 12500000),
    (1, '256GB | Mất Face ID', 8200000),
    (1, '512GB | Còn Face ID', 14000000),
    (1, '512GB | Mất Face ID', 9500000),
    (2, '256GB | Còn Face ID', 10000000),
    (2, '256GB | Mất Face ID', 7000000),
    (2, '128GB | Còn Face ID', 8500000),
    (5, '256GB | Còn Face ID', 9000000),
    (5, '256GB | Mất Face ID', 6000000),
    (9, '256GB | Màn完好', 11000000),
    (9, '256GB | Màn hỏng', 7500000),
    (10, '256GB | Màn完好', 9500000);

-- 5. Price History (Audit log)
CREATE TABLE price_history (
    id              SERIAL PRIMARY KEY,
    price_entry_id  INT          NOT NULL REFERENCES price_entries(id) ON DELETE CASCADE,
    old_price_vnd   BIGINT,
    new_price_vnd   BIGINT       NOT NULL,
    changed_by      VARCHAR(255),
    changed_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- 6. Site Settings (Key-Value)
CREATE TABLE site_settings (
    id          SERIAL PRIMARY KEY,
    key         VARCHAR(100) NOT NULL UNIQUE,
    value       TEXT,
    updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
    ('zalo_link', 'https://zalo.me/your-zalo-phone'),
    ('facebook_link', 'https://facebook.com/groups/your-group'),
    ('contact_phone', ''),
    ('notice_text', ''),
    ('site_name', 'Bảng Giá Mainboard');

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX idx_price_entries_model ON price_entries(device_model_id);
CREATE INDEX idx_price_entries_active ON price_entries(is_active);
CREATE INDEX idx_device_models_brand ON device_models(brand_id);
CREATE INDEX idx_device_models_active ON device_models(is_active);
CREATE INDEX idx_brands_category ON brands(category_id);
CREATE INDEX idx_brands_active ON brands(is_active);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE price_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public: Can read active prices, models, brands, categories
CREATE POLICY "Public can read active prices" ON price_entries
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active models" ON device_models
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active brands" ON brands
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Public can read settings" ON site_settings
    FOR SELECT USING (true);

-- Authenticated: Full access to all tables
CREATE POLICY "Authenticated can manage prices" ON price_entries
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage models" ON device_models
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage brands" ON brands
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage categories" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage settings" ON site_settings
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can read history" ON price_history
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert history" ON price_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
