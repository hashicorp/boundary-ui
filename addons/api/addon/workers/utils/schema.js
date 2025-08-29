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
        rowid, id, type, name, description, address, scope_id, created_time
    ) VALUES (
        new.rowid, new.id, new.type, new.name, new.description, new.address, new.scope_id, new.created_time
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
        rowid, id, type, name, description, destination_id, value, scope_id, created_time
    ) VALUES (
        new.rowid, new.id, new.type, new.name, new.description, new.destination_id, new.value, new.scope_id, new.created_time
    );
END;

CREATE TRIGGER IF NOT EXISTS alias_ad AFTER DELETE ON alias BEGIN
    INSERT INTO alias_fts(alias_fts, rowid, id, type, name, description, destination_id, value, scope_id, created_time)
    VALUES('delete', old.rowid, old.id, old.type, old.name, old.description, old.destination_id, old.value, old.scope_id, old.created_time);
END;`;

const createGroupTables = `
CREATE TABLE IF NOT EXISTS "group" (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT,
    description TEXT,
    scope_id TEXT NOT NULL,
    created_time TEXT NOT NULL,
    data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_group_scope_id_created_time ON "group"(scope_id, created_time DESC);

CREATE VIRTUAL TABLE IF NOT EXISTS group_fts USING fts5(
    id,
    name,
    description,
    scope_id,
    created_time,
    content='',
);

CREATE TRIGGER IF NOT EXISTS group_ai AFTER INSERT ON "group" BEGIN
    INSERT INTO group_fts(
        rowid, id, name, description, scope_id, created_time
    ) VALUES (
        new.rowid, new.id, new.name, new.description, new.scope_id, new.created_time
    );
END;

CREATE TRIGGER IF NOT EXISTS group_ad AFTER DELETE ON "group" BEGIN
    INSERT INTO group_fts(group_fts, rowid, id, name, description, scope_id, created_time)
    VALUES('delete', old.rowid, old.id, old.name, old.description, old.scope_id, old.created_time);
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
        rowid, id, name, description, scope_id, created_time
    ) VALUES (
        new.rowid, new.id, new.name, new.description, new.scope_id, new.created_time
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
        rowid, id, name, description, scope_id, created_time
    ) VALUES (
        new.rowid, new.id, new.name, new.description, new.scope_id, new.created_time
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
        rowid, id, type, name, description, scope_id, created_time
    ) VALUES (
        new.rowid, new.id, new.type, new.name, new.description, new.scope_id, new.created_time
    );
END;

CREATE TRIGGER IF NOT EXISTS credential_store_ad AFTER DELETE ON credential_store BEGIN
    INSERT INTO credential_store_fts(credential_store_fts, rowid, id, type, name, description, scope_id, created_time)
    VALUES('delete', old.rowid, old.id, old.type, old.name, old.description, old.scope_id, old.created_time);
END;`;

const createScopeTables = `
CREATE TABLE IF NOT EXISTS scope (
    id TEXT NOT NULL PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT,
    description TEXT,
    scope_id TEXT NOT NULL,
    created_time TEXT NOT NULL,
    data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_scope_scope_id_created_time ON scope(scope_id, created_time DESC);

CREATE VIRTUAL TABLE IF NOT EXISTS scope_fts USING fts5(
    id,
    type,
    name,
    description,
    scope_id,
    created_time,
    content='',
);

CREATE TRIGGER IF NOT EXISTS scope_ai AFTER INSERT ON scope BEGIN
    INSERT INTO scope_fts(
        rowid, id, type, name, description, scope_id, created_time
    ) VALUES (
        new.rowid, new.id, new.type, new.name, new.description, new.scope_id, new.created_time
    );
END;

CREATE TRIGGER IF NOT EXISTS scope_ad AFTER DELETE ON scope BEGIN
    INSERT INTO scope_fts(scope_fts, rowid, id, type, name, description, scope_id, created_time)
    VALUES('delete', old.rowid, old.id, old.type, old.name, old.description, old.scope_id, old.created_time);
END;`;

const createAuthMethodTables = `
CREATE TABLE IF NOT EXISTS auth_method (
    id TEXT NOT NULL PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT,
    description TEXT,
    is_primary INT,
    scope_id TEXT NOT NULL,
    created_time TEXT NOT NULL,
    data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auth_method_scope_id_created_time ON auth_method(scope_id, created_time DESC);

CREATE VIRTUAL TABLE IF NOT EXISTS auth_method_fts USING fts5(
    id,
    type,
    name,
    description,
    is_primary,
    scope_id,
    created_time,
    content='',
);

CREATE TRIGGER IF NOT EXISTS auth_method_ai AFTER INSERT ON auth_method BEGIN
    INSERT INTO auth_method_fts(
        rowid, id, type, name, description, is_primary, scope_id, created_time
    ) VALUES (
        new.rowid, new.id, new.type, new.name, new.description, new.is_primary, new.scope_id, new.created_time
    );
END;

CREATE TRIGGER IF NOT EXISTS auth_method_ad AFTER DELETE ON auth_method BEGIN
    INSERT INTO auth_method_fts(auth_method_fts, rowid, id, type, name, description, is_primary, scope_id, created_time)
    VALUES('delete', old.rowid, old.id, old.type, old.name, old.description, old.is_primary, old.scope_id, old.created_time);
END;`;

const createHostCatalogTables = `
CREATE TABLE IF NOT EXISTS host_catalog (
    id TEXT NOT NULL PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT,
    description TEXT,
    plugin_name TEXT,
    scope_id TEXT NOT NULL,
    created_time TEXT NOT NULL,
    data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_host_catalog_scope_id_created_time ON host_catalog(scope_id, created_time DESC);

CREATE VIRTUAL TABLE IF NOT EXISTS host_catalog_fts USING fts5(
    id,
    type,
    name,
    description,
    plugin_name,
    scope_id,
    created_time,
    content='',
);

CREATE TRIGGER IF NOT EXISTS host_catalog_ai AFTER INSERT ON host_catalog BEGIN
    INSERT INTO host_catalog_fts(
        rowid, id, type, name, description, plugin_name, scope_id, created_time
    ) VALUES (
        new.rowid, new.id, new.type, new.name, new.description, new.plugin_name, new.scope_id, new.created_time
    );
END;

CREATE TRIGGER IF NOT EXISTS host_catalog_ad AFTER DELETE ON host_catalog BEGIN
    INSERT INTO host_catalog_fts(host_catalog_fts, rowid, id, type, name, description, plugin_name, scope_id, created_time)
    VALUES('delete', old.rowid, old.id, old.type, old.name, old.description, old.plugin_name, old.scope_id, old.created_time);
END;`;

const createSessionRecordingTables = `
CREATE TABLE IF NOT EXISTS session_recording (
    id TEXT NOT NULL PRIMARY KEY,
    type TEXT NOT NULL,
    state TEXT,
    start_time TEXT,
    end_time TEXT,
    duration TEXT,
    scope_id TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    target_id TEXT,
    target_name TEXT,
    target_scope_id TEXT,
    target_scope_name TEXT,
    target_scope_parent_scope_id TEXT,
    created_time TEXT NOT NULL,
    data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_session_recording_created_time ON session_recording(created_time DESC);

CREATE VIRTUAL TABLE IF NOT EXISTS session_recording_fts USING fts5(
    id,
    type,
    state,
    start_time,
    end_time,
    duration,
    scope_id,
    user_id,
    user_name,
    target_id,
    target_name,
    target_scope_id,
    target_scope_name,
    target_scope_parent_scope_id,
    created_time,
    content='',
);

CREATE TRIGGER IF NOT EXISTS session_recording_ai AFTER INSERT ON session_recording BEGIN
    INSERT INTO session_recording_fts(
        rowid, id, type, state, start_time, end_time, duration, scope_id, user_id, user_name, target_id, target_name, target_scope_id, target_scope_name, target_scope_parent_scope_id, created_time
    ) VALUES (
        new.rowid, new.id, new.type, new.state, new.start_time, new.end_time, new.duration, new.scope_id, new.user_id, new.user_name, new.target_id, new.target_name, new.target_scope_id, new.target_scope_name, new.target_scope_parent_scope_id, new.created_time
    );
END;

CREATE TRIGGER IF NOT EXISTS session_recording_ad AFTER DELETE ON session_recording BEGIN
    INSERT INTO session_recording_fts(session_recording_fts, rowid, id, type, state, start_time, end_time, duration, scope_id, user_id, user_name, target_id, target_name, target_scope_id, target_scope_name, target_scope_parent_scope_id, created_time)
    VALUES('delete', old.rowid, old.id, old.type, old.state, old.start_time, old.end_time, old.duration, old.scope_id, old.user_id, old.user_name, old.target_id, old.target_name, old.target_scope_id, old.target_scope_name, old.target_scope_parent_scope_id, old.created_time);
END;`;

const createSessionTables = `
CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    type TEXT,
    status TEXT,
    endpoint TEXT,
    target_id TEXT,
    user_id TEXT,
    scope_id TEXT NOT NULL,
    created_time TEXT NOT NULL,
    data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_session_scope_id_created_time ON session(scope_id, created_time DESC);

CREATE VIRTUAL TABLE IF NOT EXISTS session_fts USING fts5(
    id,
    type,
    status,
    endpoint,
    target_id,
    user_id,
    scope_id,
    created_time,
    content='',
);

CREATE TRIGGER IF NOT EXISTS session_ai AFTER INSERT ON session BEGIN
    INSERT INTO session_fts(
        rowid, id, type, status, endpoint, target_id, user_id, scope_id, created_time
    ) VALUES (
        new.rowid, new.id, new.type, new.status, new.endpoint, new.target_id, new.user_id, new.scope_id, new.created_time
    );
END;

CREATE TRIGGER IF NOT EXISTS session_ad AFTER DELETE ON session BEGIN
    INSERT INTO session_fts(session_fts, rowid, id, type, status, endpoint, target_id, user_id, scope_id, created_time)
    VALUES('delete', old.rowid, old.id, old.type, old.status, old.endpoint, old.target_id, old.user_id, old.scope_id, old.created_time);
END;`;

export const CREATE_TABLES = (version) => `
BEGIN;

-- This ensures multiple triggers can activate in the scenario of using REPLACE INTO
PRAGMA recursive_triggers = true;
PRAGMA user_version = ${version};

CREATE TABLE IF NOT EXISTS token (
    id TEXT NOT NULL PRIMARY KEY,
    token TEXT NOT NULL
);

${createTargetTables}
${createAliasTables}
${createGroupTables}
${createRoleTables}
${createUserTables}
${createCredentialStoreTables}
${createScopeTables}
${createAuthMethodTables}
${createHostCatalogTables}
${createSessionRecordingTables}
${createSessionTables}

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

export const DELETE_STATEMENT = (resource, ids) => {
  const baseDeleteStatement = `DELETE FROM "${underscore(resource)}"`;
  return ids?.length > 0
    ? `${baseDeleteStatement} WHERE id IN (${ids.map(() => '?').join(',')})`
    : baseDeleteStatement;
};
