-- =============================================================================
--  ATTENDANCE MANAGEMENT SYSTEM (AMS)
--  Database Schema Script
--  
--  Description : Full schema for SQLite (default) / PostgreSQL compatible
--  Version     : 1.0  (migrations 001 + 002)
--  Generated   : 2026-06-26
--
--  Tables:
--    1. users                - System users (admin / employee login accounts)
--    2. employees            - Employee master records
--    3. attendance           - Daily attendance log
--    4. attendance_requests  - Employee regularization / correction requests
--    5. employee_queries     - Pre-login contact/query form submissions
--    6. alembic_version      - Alembic migration tracking
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 0. CLEANUP (drop in reverse FK order for a clean re-install)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS attendance_requests;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS employee_queries;
DROP TABLE IF EXISTS alembic_version;


-- ===========================================================================
-- TABLE 1 : users
-- ---------------------------------------------------------------------------
--  Stores login credentials and role for every system user.
--  role   : 'admin'    - full access (HR / manager)
--           'employee' - limited access (own records only)
--  employee_id (soft-link) links an employee-role user to an employees row.
-- ===========================================================================
CREATE TABLE users (
    id            INTEGER       NOT NULL PRIMARY KEY AUTOINCREMENT,
    username      VARCHAR(50)   NOT NULL UNIQUE,
    email         VARCHAR(100)  NOT NULL UNIQUE,
    password_hash VARCHAR       NOT NULL,
    role          VARCHAR(20)   NOT NULL DEFAULT 'employee',
    is_active     BOOLEAN       NOT NULL DEFAULT 1,
    employee_id   INTEGER       NULL,
    created_at    DATETIME      DEFAULT (CURRENT_TIMESTAMP),
    updated_at    DATETIME      NULL
);

CREATE INDEX        ix_users_id       ON users (id);
CREATE UNIQUE INDEX ix_users_username ON users (username);
CREATE UNIQUE INDEX ix_users_email    ON users (email);


-- ===========================================================================
-- TABLE 2 : employees
-- ---------------------------------------------------------------------------
--  Master employee directory.
--  employee_id : human-readable code, e.g. "EMP001"
--  status      : 'Active' | 'Inactive'
-- ===========================================================================
CREATE TABLE employees (
    id          INTEGER      NOT NULL PRIMARY KEY AUTOINCREMENT,
    employee_id VARCHAR(20)  NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    mobile      VARCHAR(15)  NULL,
    department  VARCHAR(50)  NOT NULL,
    designation VARCHAR(50)  NOT NULL,
    status      VARCHAR(10)  NOT NULL DEFAULT 'Active',
    created_at  DATETIME     DEFAULT (CURRENT_TIMESTAMP),
    updated_at  DATETIME     NULL,
    created_by  INTEGER      NULL REFERENCES users (id)
);

CREATE INDEX        ix_employees_id          ON employees (id);
CREATE UNIQUE INDEX ix_employees_employee_id ON employees (employee_id);
CREATE UNIQUE INDEX ix_employees_email       ON employees (email);


-- ===========================================================================
-- TABLE 3 : attendance
-- ---------------------------------------------------------------------------
--  One row per employee per day.
--  status         : 'Present' | 'Absent' | 'Late' | 'Half-Day'
--  is_regularized : 'N' original entry  |  'Y' admin-corrected
--
--  UNIQUE CONSTRAINT (employee_id, attendance_date) prevents duplicates.
-- ===========================================================================
CREATE TABLE attendance (
    id              INTEGER     NOT NULL PRIMARY KEY AUTOINCREMENT,
    employee_id     INTEGER     NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
    attendance_date DATE        NOT NULL,
    check_in        TIME        NULL,
    check_out       TIME        NULL,
    status          VARCHAR(10) NOT NULL DEFAULT 'Present',
    notes           TEXT        NULL,
    is_regularized  VARCHAR(1)  NOT NULL DEFAULT 'N',
    created_at      DATETIME    DEFAULT (CURRENT_TIMESTAMP),
    updated_at      DATETIME    NULL,
    marked_by       INTEGER     NULL REFERENCES users (id),
    updated_by      INTEGER     NULL REFERENCES users (id),

    CONSTRAINT uq_employee_date UNIQUE (employee_id, attendance_date)
);

CREATE INDEX ix_attendance_id              ON attendance (id);
CREATE INDEX ix_attendance_employee_id     ON attendance (employee_id);
CREATE INDEX ix_attendance_attendance_date ON attendance (attendance_date);


-- ===========================================================================
-- TABLE 4 : attendance_requests
-- ---------------------------------------------------------------------------
--  Employees submit regularization or correction requests.
--  request_type     : 'regularization' | 'correction'
--  status           : 'pending' | 'approved' | 'rejected'
--  requested_status : 'Present' | 'Absent' | 'Late' | 'Half-Day'
-- ===========================================================================
CREATE TABLE attendance_requests (
    id               INTEGER     NOT NULL PRIMARY KEY AUTOINCREMENT,
    employee_id      INTEGER     NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
    attendance_date  DATE        NOT NULL,
    request_type     VARCHAR(20) NOT NULL DEFAULT 'regularization',
    status           VARCHAR(20) NOT NULL DEFAULT 'pending',
    check_in         DATETIME    NULL,
    check_out        DATETIME    NULL,
    requested_status VARCHAR(10) NOT NULL DEFAULT 'Present',
    reason           TEXT        NULL,
    admin_notes      TEXT        NULL,
    requested_at     DATETIME    DEFAULT (CURRENT_TIMESTAMP),
    reviewed_at      DATETIME    NULL,
    reviewed_by      INTEGER     NULL REFERENCES users (id),
    created_at       DATETIME    DEFAULT (CURRENT_TIMESTAMP),
    updated_at       DATETIME    NULL
);

CREATE INDEX ix_attendance_requests_id              ON attendance_requests (id);
CREATE INDEX ix_attendance_requests_employee_id     ON attendance_requests (employee_id);
CREATE INDEX ix_attendance_requests_attendance_date ON attendance_requests (attendance_date);


-- ===========================================================================
-- TABLE 5 : employee_queries
-- ---------------------------------------------------------------------------
--  Pre-login contact form. Visitors submit queries before having an account.
--  status : 'pending' | 'resolved'
-- ===========================================================================
CREATE TABLE employee_queries (
    id         INTEGER      NOT NULL PRIMARY KEY AUTOINCREMENT,
    username   VARCHAR(50)  NOT NULL,
    email      VARCHAR(100) NOT NULL,
    phone      VARCHAR(20)  NOT NULL,
    status     VARCHAR(20)  NOT NULL DEFAULT 'pending',
    created_at DATETIME     DEFAULT (CURRENT_TIMESTAMP),
    updated_at DATETIME     NULL
);


-- ===========================================================================
-- TABLE 6 : alembic_version
-- ---------------------------------------------------------------------------
--  Tracks which Alembic migration has been applied last.
-- ===========================================================================
CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL PRIMARY KEY
);


-- ===========================================================================
-- SEED DATA
-- ---------------------------------------------------------------------------
--  Records the latest applied migration version.
--
--  NOTE on admin password hash:
--  Replace the placeholder hash below with the real bcrypt hash for your
--  ADMIN_PASSWORD value from your .env file.
--
--  To generate the correct hash run:
--      cd backend
--      python -c "from app.utils.security import hash_password; print(hash_password('your_password'))"
--
--  Then paste the output in place of the REPLACE_WITH_BCRYPT_HASH value below.
-- ===========================================================================
INSERT INTO alembic_version (version_num) VALUES ('002');

INSERT INTO users (username, email, password_hash, role, is_active)
VALUES (
    'admin',
    'admin@company.com',
    '$2b$12$REPLACE_WITH_BCRYPT_HASH_OF_YOUR_ADMIN_PASSWORD',
    'admin',
    1
);


-- ===========================================================================
-- QUICK REFERENCE - Column Enums and Allowed Values
-- ===========================================================================
--
--  users.role                        : 'admin'          | 'employee'
--  users.is_active                   : 1 (true)         | 0 (false)
--
--  employees.status                  : 'Active'         | 'Inactive'
--
--  attendance.status                 : 'Present' | 'Absent' | 'Late' | 'Half-Day'
--  attendance.is_regularized         : 'N'              | 'Y'
--
--  attendance_requests.request_type  : 'regularization' | 'correction'
--  attendance_requests.status        : 'pending'        | 'approved' | 'rejected'
--  attendance_requests.requested_status : 'Present' | 'Absent' | 'Late' | 'Half-Day'
--
--  employee_queries.status           : 'pending'        | 'resolved'
--
-- ===========================================================================
-- END OF SCRIPT
-- ===========================================================================
