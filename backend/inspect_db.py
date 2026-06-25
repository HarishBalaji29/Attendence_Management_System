import sqlite3

conn = sqlite3.connect('attendance.db')
cursor = conn.cursor()

# Get all tables, skipping system tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [t[0] for t in cursor.fetchall() if not t[0].startswith('sqlite_') and not t[0] == 'alembic_version']

print("==================================================")
print("AttendX SQLite Database Structure & Tables Preview")
print("==================================================\n")

for table in tables:
    print(f"Table: {table}")
    cursor.execute(f"PRAGMA table_info({table});")
    for col in cursor.fetchall():
        cid, name, col_type, notnull, dflt_value, pk = col
        pk_str = " [PRIMARY KEY]" if pk else ""
        null_str = " [NOT NULL]" if notnull else ""
        default_str = f" (Default: {dflt_value})" if dflt_value else ""
        print(f"  - {name:<16} : {col_type:<10}{pk_str}{null_str}{default_str}")
    
    # Row count
    cursor.execute(f"SELECT COUNT(*) FROM {table};")
    count = cursor.fetchone()[0]
    print(f"  Total Rows: {count}\n")

print("==================================================")
conn.close()
