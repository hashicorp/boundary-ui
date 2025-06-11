export const CLEAR_DB = `
PRAGMA writable_schema = 1;
DELETE FROM sqlite_master;
PRAGMA writable_schema = 0;
VACUUM;
PRAGMA integrity_check;`;

export const CREATE_TABLES = `
BEGIN;

CREATE TABLE IF NOT EXISTS target (
    id TEXT NOT NULL PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    address TEXT,
    scope_id TEXT NOT NULL,
    created_time TIMESTAMP,
    data TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS token (
    id TEXT NOT NULL PRIMARY KEY,
    token TEXT NOT NULL
);

COMMIT;`;

export const INSERT_STATEMENTS = {
  token: (items) =>
    `REPLACE INTO token (id, token) VALUES ${items.map(() => '(?, ?)').join(', ')};`,
  target: (items) =>
    `INSERT INTO target (id, type, name, description, address, scope_id, created_time, data) VALUES ${items.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ')};`,
};

export const DELETE_STATEMENT = (resource, ids) =>
  `DELETE FROM ${resource} WHERE id IN (${ids.map(() => '?').join(',')})`;
