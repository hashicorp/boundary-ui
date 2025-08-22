/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { underscore } from '@ember/string';

export const CLEAR_DB = `
PRAGMA writable_schema = 1;
DELETE FROM sqlite_master;
PRAGMA writable_schema = 0;
VACUUM;
PRAGMA integrity_check;`;

const createTargetTables = `
    CREATE TABLE IF NOT EXISTS target (
    id TEXT NOT NULL PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    scope_id TEXT NOT NULL,
    created_time TEXT NOT NULL,
    data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_target_scope_id_created_time ON target(scope_id, created_time DESC);

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
END;`;

const createAliasTables = `
CREATE TABLE IF NOT EXISTS alias (
    id TEXT NOT NULL PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT,
    description TEXT,
    destination_id TEXT,
    value TEXT,
    scope_id TEXT NOT NULL,
    created_time TEXT NOT NULL,
    data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_alias_created_time ON alias(created_time DESC);

CREATE VIRTUAL TABLE IF NOT EXISTS alias_fts USING fts5(
    id,
    type,
    name,
    description,
    destination_id,
    value,
    scope_id,
    created_time,
    content='',
);

CREATE TRIGGER IF NOT EXISTS alias_ai AFTER INSERT ON alias BEGIN
    INSERT INTO alias_fts(
        id, type, name, description, destination_id, value, scope_id, created_time
    ) VALUES (
        new.id, new.type, new.name, new.description, new.destination_id, new.value, new.scope_id, new.created_time
    );
END;

CREATE TRIGGER IF NOT EXISTS alias_ad AFTER DELETE ON alias BEGIN
    INSERT INTO alias_fts(alias_fts, rowid, id, type, name, description, destination_id, value, scope_id, created_time)
    VALUES('delete', old.rowid, old.id, old.type, old.name, old.description, old.destination_id, old.value, old.scope_id, old.created_time);
END;`;

const createRoleTables = `
CREATE TABLE IF NOT EXISTS role (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT,
    description TEXT,
    scope_id TEXT NOT NULL,
    created_time TEXT NOT NULL,
    data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_role_scope_id_created_time ON role(scope_id, created_time DESC);

CREATE VIRTUAL TABLE IF NOT EXISTS role_fts USING fts5(
    id,
    name,
    description,
    scope_id,
    created_time,
    content='',
);

CREATE TRIGGER IF NOT EXISTS role_ai AFTER INSERT ON role BEGIN
    INSERT INTO role_fts(
        id, name, description, scope_id, created_time
    ) VALUES (
        new.id, new.name, new.description, new.scope_id, new.created_time
    );
END;

CREATE TRIGGER IF NOT EXISTS role_ad AFTER DELETE ON role BEGIN
    INSERT INTO role_fts(role_fts, rowid, id, name, description, scope_id, created_time)
    VALUES('delete', old.rowid, old.id, old.name, old.description, old.scope_id, old.created_time);
END;`;

const createUserTables = `
CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT,
    description TEXT,
    scope_id TEXT NOT NULL,
    created_time TEXT NOT NULL,
    data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_scope_id_created_time ON user(scope_id, created_time DESC);

CREATE VIRTUAL TABLE IF NOT EXISTS user_fts USING fts5(
    id,
    name,
    description,
    scope_id,
    created_time,
    content='',
);

CREATE TRIGGER IF NOT EXISTS user_ai AFTER INSERT ON user BEGIN
    INSERT INTO user_fts(
        id, name, description, scope_id, created_time
    ) VALUES (
        new.id, new.name, new.description, new.scope_id, new.created_time
    );
END;

CREATE TRIGGER IF NOT EXISTS user_ad AFTER DELETE ON user BEGIN
    INSERT INTO user_fts(user_fts, rowid, id, name, description, scope_id, created_time)
    VALUES('delete', old.rowid, old.id, old.name, old.description, old.scope_id, old.created_time);
END;`;

const createCredentialStoreTables = `
CREATE TABLE IF NOT EXISTS credential_store (
    id TEXT NOT NULL PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT,
    description TEXT,
    scope_id TEXT NOT NULL,
    created_time TEXT NOT NULL,
    data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_credential_store_scope_id_created_time ON credential_store(scope_id, created_time DESC);

CREATE VIRTUAL TABLE IF NOT EXISTS credential_store_fts USING fts5(
    id,
    type,
    name,
    description,
    scope_id,
    created_time,
    content='',
);

CREATE TRIGGER IF NOT EXISTS credential_store_ai AFTER INSERT ON credential_store BEGIN
    INSERT INTO credential_store_fts(
        id, type, name, description, scope_id, created_time
    ) VALUES (
        new.id, new.type, new.name, new.description, new.scope_id, new.created_time
    );
END;

CREATE TRIGGER IF NOT EXISTS credential_store_ad AFTER DELETE ON credential_store BEGIN
    INSERT INTO credential_store_fts(credential_store_fts, rowid, id, type, name, description, scope_id, created_time)
    VALUES('delete', old.rowid, old.id, old.type, old.name, old.description, old.scope_id, old.created_time);
END;`;

export const CREATE_TABLES = (version) => `
BEGIN;

PRAGMA user_version = ${version};

CREATE TABLE IF NOT EXISTS token (
    id TEXT NOT NULL PRIMARY KEY,
    token TEXT NOT NULL
);

${createTargetTables}
${createAliasTables}
${createRoleTables}
${createUserTables}
${createCredentialStoreTables}

CREATE TABLE IF NOT EXISTS "group" (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT,
    description TEXT,
    scope_id TEXT NOT NULL,
    created_time TEXT NOT NULL,
    data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_group_scope_id_created_time ON "group"(scope_id, created_time DESC);

COMMIT;`;

export const INSERT_STATEMENTS = (resource, items, modelMapping) => {
  if (resource === 'token') {
    return `REPLACE INTO token (id, token) VALUES ${items.map(() => '(?, ?)').join(', ')};`;
  }

  if (!modelMapping?.[resource]) {
    throw new Error(`modelMapping is required for ${resource} insertions.`);
  }

  const columns = Object.keys(modelMapping[resource]);
  // Extra column for the data column
  const numColumns = Array(columns.length + 1);
  const placeholders = `(${numColumns.fill('?').join(', ')})`;

  return `REPLACE INTO "${underscore(resource)}" (${columns.join(', ')}, data) VALUES ${items.map(() => placeholders).join(', ')};`;
};

export const DELETE_STATEMENT = (resource, ids) =>
  `DELETE FROM "${underscore(resource)}" WHERE id IN (${ids.map(() => '?').join(',')})`;
