-- ugur/docs/database_schema.sql

CREATE TYPE user_role AS ENUM ('customer', 'courier', 'admin', 'business_owner');
CREATE TYPE order_status_enum AS ENUM ('new', 'preparing', 'ready_for_pickup', 'courier_assigned', 'on_the_way', 'delivered', 'cancelled');
CREATE TYPE payment_method_enum AS ENUM ('online', 'cash_on_delivery');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE vehicle_type_enum AS ENUM ('bicycle', 'motorcycle', 'car');
CREATE TYPE availability_status_enum AS ENUM ('online', 'offline', 'on_delivery');
CREATE TYPE review_type_enum AS ENUM ('order_experience', 'courier_service');

CREATE TABLE IF NOT EXISTS Пользователи (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Предприятия (
    business_id SERIAL PRIMARY KEY,
    owner_user_id INTEGER REFERENCES Пользователи(user_id) ON DELETE SET NULL, -- İşletme sahibi silinirse işletme kalabilir veya farklı bir mantık uygulanabilir
    name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone_number VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Продукты ( -- Продукты/Услуги yerine sadece Продукты daha yaygın
    product_id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES Предприятия(business_id) ON DELETE CASCADE, -- İşletme silinirse ürünleri de silinir
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(512),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Курьеры_Детали ( -- Kurye detayları için ayrı tablo
    courier_detail_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Пользователи(user_id) ON DELETE CASCADE UNIQUE, -- Kurye kullanıcısı silinirse detayları da silinir
    vehicle_type vehicle_type_enum,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    availability_status availability_status_enum DEFAULT 'offline',
    average_rating DECIMAL(3, 2) DEFAULT 0.00, -- Ortalama puan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Заказы (
    order_id SERIAL PRIMARY KEY,
    customer_user_id INTEGER NOT NULL REFERENCES Пользователи(user_id) ON DELETE RESTRICT, -- Müşteri silinirse siparişleri kalmalı mı? Genelde restrict veya set null.
    business_id INTEGER NOT NULL REFERENCES Предприятия(business_id) ON DELETE RESTRICT, -- İşletme silinirse siparişleri kalmalı mı?
    courier_user_id INTEGER REFERENCES Пользователи(user_id) ON DELETE SET NULL, -- Kurye silinirse siparişten kurye bilgisi kalkar
    delivery_address TEXT NOT NULL,
    delivery_latitude DECIMAL(10, 8),
    delivery_longitude DECIMAL(11, 8),
    contact_phone VARCHAR(50),
    payment_method payment_method_enum NOT NULL,
    payment_status payment_status_enum DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status order_status_enum DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE, -- Tahmini teslimat süresi
    actual_delivery_time TIMESTAMP WITH TIME ZONE -- Gerçekleşen teslimat süresi
);

CREATE TABLE IF NOT EXISTS Позиции_Заказа (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES Заказы(order_id) ON DELETE CASCADE, -- Sipariş silinirse kalemleri de silinir
    product_id INTEGER NOT NULL REFERENCES Продукты(product_id) ON DELETE RESTRICT, -- Ürün silinirse sipariş kalemi ne olacak? Genelde restrict.
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_per_unit DECIMAL(10, 2) NOT NULL, -- O anki ürün fiyatı
    total_price_for_item DECIMAL(10, 2) NOT NULL -- quantity * price_per_unit
);

CREATE TABLE IF NOT EXISTS Отзывы (
    review_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES Заказы(order_id) ON DELETE CASCADE,
    customer_user_id INTEGER NOT NULL REFERENCES Пользователи(user_id) ON DELETE CASCADE, -- Yorum yapan müşteri silinirse yorumu da silinsin
    courier_user_id INTEGER REFERENCES Пользователи(user_id) ON DELETE SET NULL, -- Puanlanan kurye silinirse kurye_id null olur
    target_business_id INTEGER REFERENCES Предприятия(business_id) ON DELETE SET NULL, -- Eğer işletmeye de puan veriliyorsa
    rating_score INTEGER NOT NULL CHECK (rating_score >= 1 AND rating_score <= 5),
    comment TEXT,
    review_type review_type_enum NOT NULL, -- 'order_experience' veya 'courier_service' gibi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler (Performans için önemli)
CREATE INDEX IF NOT EXISTS idx_users_email ON Пользователи(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON Пользователи(role);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON Предприятия(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_products_business_id ON Продукты(business_id);
CREATE INDEX IF NOT EXISTS idx_couriers_user_id ON Курьеры_Детали(user_id);
CREATE INDEX IF NOT EXISTS idx_couriers_availability ON Курьеры_Детали(availability_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON Заказы(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON Заказы(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_courier_id ON Заказы(courier_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON Заказы(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON Позиции_Заказа(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON Позиции_Заказа(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON Отзывы(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON Отзывы(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_courier_id ON Отзывы(courier_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_target_business_id ON Отзывы(target_business_id);

-- Fonksiyonlar (updated_at sütununu otomatik güncellemek için)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'lar (updated_at için)
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON Пользователи
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_businesses
BEFORE UPDATE ON Предприятия
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_products
BEFORE UPDATE ON Продукты
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_courier_details
BEFORE UPDATE ON Курьеры_Детали
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_orders
BEFORE UPDATE ON Заказы
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Not: Позиции_Заказа ve Отзывы tabloları genellikle sadece oluşturulur, güncellenmez.
-- Eğer güncellenme senaryoları varsa onlara da trigger eklenebilir.
