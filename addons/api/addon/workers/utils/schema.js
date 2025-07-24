/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

export const CLEAR_DB = `
PRAGMA writable_schema = 1;
DELETE FROM sqlite_master;
PRAGMA writable_schema = 0;
VACUUM;
PRAGMA integrity_check;`;

export const CREATE_TABLES = (version) => `
BEGIN;

PRAGMA user_version = ${version};

CREATE TABLE IF NOT EXISTS token (
    id TEXT NOT NULL PRIMARY KEY,
    token TEXT NOT NULL
);

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
CREATE INDEX IF NOT EXISTS idx_target_scope_id ON target(scope_id);

-- Create a contentless FTS table as we will only use the rowids.
-- Note that this only creates the FTS index and cannot reference the target content
CREATE VIRTUAL TABLE IF NOT EXISTS target_fts USING fts5(
    id,
    type,
    name,
    description,
    address,
    scope_id,
    created_time,
    content='',
);

-- Create triggers to keep the FTS table in sync with the target table
-- Note: The FTS table does not have an update trigger, as it's updated only on
-- INSERT and DELETE as we do an INSERT OR REPLACE INTO on the table
-- which replaces the row and doesn't execute an UPDATE trigger.
CREATE TRIGGER IF NOT EXISTS target_ai AFTER INSERT ON target BEGIN
    INSERT INTO target_fts(
        id, type, name, description, address, scope_id, created_time
    ) VALUES (
        new.id, new.type, new.name, new.description, new.address, new.scope_id, new.created_time
    );
END;

CREATE TRIGGER IF NOT EXISTS target_ad AFTER DELETE ON target BEGIN
    INSERT INTO target_fts(target_fts, rowid, id, type, name, description, address, scope_id, created_time)
    VALUES('delete', old.rowid, old.id, old.type, old.name, old.description, old.address, old.scope_id, old.created_time);
END;

COMMIT;`;

export const INSERT_STATEMENTS = {
  token: (items) =>
    `REPLACE INTO token (id, token) VALUES ${items.map(() => '(?, ?)').join(', ')};`,
  target: (items) =>
    `REPLACE INTO target (id, type, name, description, address, scope_id, created_time, data) VALUES ${items.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ')};`,
};

export const DELETE_STATEMENT = (resource, ids) =>
  `DELETE FROM ${resource} WHERE id IN (${ids.map(() => '?').join(',')})`;
