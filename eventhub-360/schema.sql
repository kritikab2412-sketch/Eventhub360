-- EventHub 360 PostgreSQL Database Schema DDL

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES (Core Organization)
CREATE TABLE IF NOT EXISTS tenant (
    tenant_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    subdomain VARCHAR(80) UNIQUE NOT NULL,
    plan VARCHAR(20) NOT NULL DEFAULT 'Starter',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company (
    company_id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenant(tenant_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    gstin VARCHAR(15),
    pan VARCHAR(10),
    base_currency CHAR(3) NOT NULL DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS branch (
    branch_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES company(company_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venue (
    venue_id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branch(branch_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLES (RBAC)
CREATE TABLE IF NOT EXISTS user_account (
    user_id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenant(tenant_id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role (
    role_id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenant(tenant_id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS permission (
    permission_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS user_role (
    user_id BIGINT NOT NULL REFERENCES user_account(user_id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES role(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permission (
    role_id BIGINT NOT NULL REFERENCES role(role_id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permission(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. TABLES (CRM & Sales)
CREATE TABLE IF NOT EXISTS contact (
    contact_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES company(company_id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lead (
    lead_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES company(company_id) ON DELETE CASCADE,
    contact_id BIGINT NOT NULL REFERENCES contact(contact_id) ON DELETE CASCADE,
    source VARCHAR(30) NOT NULL,
    event_type VARCHAR(40),
    event_date DATE,
    budget DECIMAL(14,2),
    stage VARCHAR(20) NOT NULL DEFAULT 'New',
    owner_id BIGINT REFERENCES user_account(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotation (
    quotation_id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT NOT NULL REFERENCES lead(lead_id) ON DELETE CASCADE,
    version INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    margin DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(15) NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotation_line (
    line_id BIGSERIAL PRIMARY KEY,
    quotation_id BIGINT NOT NULL REFERENCES quotation(quotation_id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL,
    qty INT NOT NULL DEFAULT 1,
    rate DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    cost DECIMAL(14,2) NOT NULL DEFAULT 0.00
);

-- 5. TABLES (Bookings & Operations)
CREATE TABLE IF NOT EXISTS booking (
    booking_id BIGSERIAL PRIMARY KEY,
    booking_ref VARCHAR(30) UNIQUE NOT NULL,
    quotation_id BIGINT NOT NULL REFERENCES quotation(quotation_id) ON DELETE RESTRICT,
    status VARCHAR(15) NOT NULL DEFAULT 'Tentative',
    hold_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event (
    event_id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES booking(booking_id) ON DELETE RESTRICT,
    venue_id BIGINT REFERENCES venue(venue_id) ON DELETE SET NULL,
    start_dt TIMESTAMP NOT NULL,
    end_dt TIMESTAMP NOT NULL,
    headcount INT NOT NULL DEFAULT 0,
    status VARCHAR(15) NOT NULL DEFAULT 'Planning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_task (
    task_id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES event(event_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Todo',
    due_date TIMESTAMP,
    owner_id BIGINT REFERENCES user_account(user_id) ON DELETE SET NULL
);

-- 6. TABLES (Vendors)
CREATE TABLE IF NOT EXISTS vendor (
    vendor_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES company(company_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(40) NOT NULL,
    gstin VARCHAR(15),
    pan VARCHAR(10),
    is_blacklisted BOOLEAN NOT NULL DEFAULT FALSE,
    rating DECIMAL(3,2) NOT NULL DEFAULT 5.00
);

CREATE TABLE IF NOT EXISTS event_vendor (
    event_id BIGINT NOT NULL REFERENCES event(event_id) ON DELETE CASCADE,
    vendor_id BIGINT NOT NULL REFERENCES vendor(vendor_id) ON DELETE CASCADE,
    cost DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (event_id, vendor_id)
);

-- 7. TABLES (Vehicles & Transport)
CREATE TABLE IF NOT EXISTS vehicle (
    vehicle_id BIGSERIAL PRIMARY KEY,
    type VARCHAR(30) NOT NULL,
    capacity INT NOT NULL,
    reg_no VARCHAR(20) UNIQUE NOT NULL,
    owner_type VARCHAR(10) NOT NULL DEFAULT 'Owned'
);

CREATE TABLE IF NOT EXISTS driver (
    driver_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_no VARCHAR(30) UNIQUE NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS transport_trip (
    trip_id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES event(event_id) ON DELETE CASCADE,
    vehicle_id BIGINT REFERENCES vehicle(vehicle_id) ON DELETE SET NULL,
    driver_id BIGINT REFERENCES driver(driver_id) ON DELETE SET NULL,
    pickup_time TIMESTAMP NOT NULL,
    passenger_count INT NOT NULL DEFAULT 0
);

-- 8. TABLES (Hotel Rooms & Blocks)
CREATE TABLE IF NOT EXISTS hotel_room (
    room_id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branch(branch_id) ON DELETE CASCADE,
    room_no VARCHAR(10) NOT NULL,
    type VARCHAR(30) NOT NULL,
    status VARCHAR(15) NOT NULL DEFAULT 'Clean',
    UNIQUE (branch_id, room_no)
);

CREATE TABLE IF NOT EXISTS room_block (
    block_id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES event(event_id) ON DELETE CASCADE,
    room_type VARCHAR(30) NOT NULL,
    qty INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS guest (
    guest_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS reservation (
    reservation_id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES hotel_room(room_id) ON DELETE RESTRICT,
    guest_id BIGINT NOT NULL REFERENCES guest(guest_id) ON DELETE RESTRICT,
    event_id BIGINT REFERENCES event(event_id) ON DELETE SET NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    status VARCHAR(15) NOT NULL DEFAULT 'Confirmed'
);

-- 9. TABLES (Invoicing & Payouts)
CREATE TABLE IF NOT EXISTS invoice (
    invoice_id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES booking(booking_id) ON DELETE CASCADE,
    type VARCHAR(12) NOT NULL DEFAULT 'Proforma',
    total DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    balance DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(12) NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment (
    payment_id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoice(invoice_id) ON DELETE CASCADE,
    mode VARCHAR(15) NOT NULL,
    amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    gateway_ref VARCHAR(60) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABLES (Audit Trail)
CREATE TABLE IF NOT EXISTS audit_log (
    audit_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES user_account(user_id) ON DELETE SET NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. INDEXES
CREATE INDEX IF NOT EXISTS idx_lead_stage_date ON lead (company_id, stage, event_date);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log (entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_booking_ref ON booking (booking_ref);
CREATE INDEX IF NOT EXISTS idx_quotation_lead ON quotation (lead_id);
CREATE INDEX IF NOT EXISTS idx_reservation_dates ON reservation (check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_hotel_room_status ON hotel_room (branch_id, status);

-- 12. AUDIT LOGGING FUNCTION & TRIGGERS
CREATE OR REPLACE FUNCTION log_audit_change()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id BIGINT := NULL; -- Can be set from context
    v_old_val JSONB := NULL;
    v_new_val JSONB := NULL;
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        v_old_val := to_jsonb(OLD);
        v_new_val := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        v_new_val := to_jsonb(NEW);
    ELSIF (TG_OP = 'DELETE') THEN
        v_old_val := to_jsonb(OLD);
    END IF;

    INSERT INTO audit_log (user_id, entity, entity_id, action, old_value, new_value)
    VALUES (
        v_user_id,
        TG_TABLE_NAME,
        COALESCE(NEW.lead_id, NEW.quotation_id, NEW.booking_id, NEW.event_id, NEW.payment_id, 1),
        TG_OP,
        v_old_val,
        v_new_val
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to core transactional tables
CREATE TRIGGER trg_audit_lead
AFTER INSERT OR UPDATE OR DELETE ON lead
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER trg_audit_quotation
AFTER INSERT OR UPDATE OR DELETE ON quotation
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER trg_audit_booking
AFTER INSERT OR UPDATE OR DELETE ON booking
FOR EACH ROW EXECUTE FUNCTION log_audit_change();
