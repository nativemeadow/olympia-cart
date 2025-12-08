CREATE TABLE IF NOT EXISTS "migrations"(
  "id" integer primary key autoincrement not null,
  "migration" varchar not null,
  "batch" integer not null
);
CREATE TABLE IF NOT EXISTS "users"(
  "id" integer primary key autoincrement not null,
  "first_name" varchar not null,
  "last_name" varchar not null,
  "email" varchar not null,
  "email_verified_at" datetime,
  "password" varchar not null,
  "remember_token" varchar,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE UNIQUE INDEX "users_email_unique" on "users"("email");
CREATE TABLE IF NOT EXISTS "password_reset_tokens"(
  "email" varchar not null,
  "token" varchar not null,
  "created_at" datetime,
  primary key("email")
);
CREATE TABLE IF NOT EXISTS "sessions"(
  "id" varchar not null,
  "user_id" integer,
  "ip_address" varchar,
  "user_agent" text,
  "payload" text not null,
  "last_activity" integer not null,
  primary key("id")
);
CREATE INDEX "sessions_user_id_index" on "sessions"("user_id");
CREATE INDEX "sessions_last_activity_index" on "sessions"("last_activity");
CREATE TABLE IF NOT EXISTS "cache"(
  "key" varchar not null,
  "value" text not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "cache_locks"(
  "key" varchar not null,
  "owner" varchar not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "jobs"(
  "id" integer primary key autoincrement not null,
  "queue" varchar not null,
  "payload" text not null,
  "attempts" integer not null,
  "reserved_at" integer,
  "available_at" integer not null,
  "created_at" integer not null
);
CREATE INDEX "jobs_queue_index" on "jobs"("queue");
CREATE TABLE IF NOT EXISTS "job_batches"(
  "id" varchar not null,
  "name" varchar not null,
  "total_jobs" integer not null,
  "pending_jobs" integer not null,
  "failed_jobs" integer not null,
  "failed_job_ids" text not null,
  "options" text,
  "cancelled_at" integer,
  "created_at" integer not null,
  "finished_at" integer,
  primary key("id")
);
CREATE TABLE IF NOT EXISTS "failed_jobs"(
  "id" integer primary key autoincrement not null,
  "uuid" varchar not null,
  "connection" text not null,
  "queue" text not null,
  "payload" text not null,
  "exception" text not null,
  "failed_at" datetime not null default CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" on "failed_jobs"("uuid");
CREATE TABLE IF NOT EXISTS "categories"(
  "id" integer primary key autoincrement not null,
  "uuid" varchar not null,
  "title" varchar not null,
  "slug" varchar not null,
  "description" text,
  "image" varchar,
  "is_active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime
);
CREATE UNIQUE INDEX "categories_uuid_unique" on "categories"("uuid");
CREATE UNIQUE INDEX "categories_slug_unique" on "categories"("slug");
CREATE TABLE IF NOT EXISTS "category_category"(
  "id" integer primary key autoincrement not null,
  "order" integer not null,
  "parent_id" integer,
  "child_id" integer not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("parent_id") references "categories"("id") on delete cascade,
  foreign key("child_id") references "categories"("id") on delete cascade
);
CREATE UNIQUE INDEX "category_category_parent_id_child_id_unique" on "category_category"(
  "parent_id",
  "child_id"
);
CREATE TABLE IF NOT EXISTS "products"(
  "id" integer primary key autoincrement not null,
  "uuid" varchar not null,
  "sku" varchar not null,
  "slug" varchar not null,
  "title" varchar not null,
  "description" text,
  "image" varchar,
  "status" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime
);
CREATE UNIQUE INDEX "products_uuid_unique" on "products"("uuid");
CREATE TABLE IF NOT EXISTS "prices"(
  "id" integer primary key autoincrement not null,
  "product_id" integer not null,
  "sku" varchar not null,
  "title" varchar,
  "description" text,
  "image" varchar,
  "price" numeric not null,
  "currency" varchar not null default 'USD',
  "unit" varchar not null default 'each',
  "size" varchar,
  "coverage" varchar,
  "coverage_value" numeric,
  "online_minimum" numeric,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("product_id") references "products"("id") on delete cascade
);
CREATE INDEX "prices_product_id_index" on "prices"("product_id");
CREATE TABLE IF NOT EXISTS "category_product"(
  "id" integer primary key autoincrement not null,
  "category_id" integer not null,
  "product_id" integer not null,
  "sku" varchar,
  "product_order" integer,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("category_id") references "categories"("id") on delete cascade,
  foreign key("product_id") references "products"("id") on delete cascade
);
CREATE UNIQUE INDEX "category_product_category_id_product_id_unique" on "category_product"(
  "category_id",
  "product_id"
);
CREATE TABLE IF NOT EXISTS "addresses"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "name" varchar,
  "street1" varchar not null,
  "street2" varchar,
  "city" varchar not null,
  "state" varchar not null,
  "zip" varchar not null,
  "country" varchar not null default 'USA',
  "phone" varchar not null,
  "default" tinyint(1) not null default '0',
  "billing" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "images"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "description" varchar,
  "image" varchar not null,
  "category" varchar,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE TABLE IF NOT EXISTS "contact_us"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "email" varchar not null,
  "phone" varchar not null,
  "subject" varchar not null,
  "message" text not null,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE TABLE IF NOT EXISTS "customers"(
  "id" integer primary key autoincrement not null,
  "user_id" integer,
  "first_name" varchar not null,
  "last_name" varchar not null,
  "email" varchar not null,
  "phone" varchar,
  "company" varchar,
  "active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE UNIQUE INDEX "customers_email_unique" on "customers"("email");
CREATE TABLE IF NOT EXISTS "carts"(
  "id" integer primary key autoincrement not null,
  "cart_uuid" varchar not null,
  "user_id" integer,
  "session_id" varchar,
  "status" varchar not null,
  "active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  "total" numeric not null,
  foreign key("user_id") references "users"("id") on delete set null
);
CREATE UNIQUE INDEX "carts_cart_uuid_unique" on "carts"("cart_uuid");
CREATE UNIQUE INDEX "carts_session_id_unique" on "carts"("session_id");
CREATE TABLE IF NOT EXISTS "cart_items"(
  "id" integer primary key autoincrement not null,
  "cart_id" integer not null,
  "product_id" integer not null,
  "category_slug" varchar,
  "product_slug" varchar,
  "sku" varchar,
  "title" varchar,
  "image" varchar,
  "quantity" integer not null default '1',
  "price" numeric not null,
  "unit" varchar,
  "color" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("cart_id") references "carts"("id") on delete cascade,
  foreign key("product_id") references "products"("id")
);

INSERT INTO migrations VALUES(1,'0001_01_01_000000_create_users_table',1);
INSERT INTO migrations VALUES(2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO migrations VALUES(3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO migrations VALUES(4,'2025_08_22_225744_create_categories_table',1);
INSERT INTO migrations VALUES(5,'2025_08_23_000001_create_category_category_pivot_table',1);
INSERT INTO migrations VALUES(6,'2025_08_26_015726_create_products_table',1);
INSERT INTO migrations VALUES(7,'2025_08_26_204931_create_prices_table',1);
INSERT INTO migrations VALUES(8,'2025_08_27_172557_create_category_product_table',1);
INSERT INTO migrations VALUES(9,'2025_08_27_174400_create_addresses_table',1);
INSERT INTO migrations VALUES(10,'2025_08_27_175242_create_images_table',1);
INSERT INTO migrations VALUES(11,'2025_09_01_165957_create_contact_uses_table',1);
INSERT INTO migrations VALUES(12,'2025_09_24_170027_create_customers_table',1);
INSERT INTO migrations VALUES(13,'2025_09_24_171116_create_carts_table',1);
INSERT INTO migrations VALUES(14,'2025_09_24_171322_create_cart_items_table',1);
INSERT INTO migrations VALUES(15,'2025_09_25_002417_update_carts_table',1);
INSERT INTO migrations VALUES(16,'2025_09_25_012914_update_carts_items_table',1);
