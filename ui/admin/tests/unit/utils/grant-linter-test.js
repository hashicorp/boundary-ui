/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'admin/tests/helpers/mirage';
import { createGrantLinter } from 'admin/utils/grant-linter';

const createContext = (lineText) => ({
  pos: lineText.length,
  state: {
    doc: {
      toString() {
        return lineText;
      },
    },
  },
});

module('Unit | Utility | grant-linter', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const response = await fetch('/grants-schema.json');

    if (!response.ok) {
      throw new Error(`Failed to fetch grants schema: ${response.status}`);
    }

    const grantsSchemaData = await response.json();
    this.grantLinter = createGrantLinter(grantsSchemaData);
  });

  test.each(
    'diagnostics for syntax and formatting errors',
    [
      ['ids=*; type=*; actions=*', 'Whitespace is not allowed'], // whitespace around semicolons
      ['ids=*;type= *;actions=*', 'Whitespace is not allowed'], // whitespace around equal sign
      ['ids=*;type=*;actions=read, write', 'Whitespace is not allowed'], // whitespace around commas
      ['ids=*;type=*;actions=read,write;', 'Trailing semicolon is not allowed'], // trailing semicolon
      ['ids={{.Account.Id}};type=+;actions=read', 'Invalid character "+"'], // invalid character +
      ['ids={{.Account.Id}};type=();actions=read', 'Invalid character "("'], // invalid characters ()
      ['type=target', 'Missing required field: actions'], // missing actions field
      ['actions=read,write', 'Missing required fields: ids and/or type'], // missing type/ids field
      [
        'type=credential-store;ids=;actions=read',
        '"ids" value cannot be empty',
      ], // empty ids value
      ['type=;actions=read', '"type" value cannot be empty'], // empty type field
      ['ids=csst_1234;actions=', '"actions" value cannot be empty'], // empty actions value
      [
        'type=credential;ids=csst_1234;actions=read,write;ids=cs_5678',
        'Duplicate field "ids" found',
      ], // duplicate ids field
      [
        'type=credential;actions=read,write;type=host',
        'Duplicate field "type" found',
      ], // duplicate type field
      [
        'type=credential;ids=csst_1234;actions=read,write;actions=delete',
        'Duplicate field "actions" found',
      ], // duplicate actions field
      [
        'type=credential;ids=cs_1234;actions=read;random=name',
        'Unknown field "random". Valid fields are: actions, ids, type, output_fields',
      ], // unknown field "random"
      [
        '=credential;actions=;ids=cs_1234',
        'Invalid format: expected key=value',
      ], // missing type key
    ],
    function (assert, [grantString, errorMsg]) {
      const diagnostics = this.grantLinter(createContext(grantString));

      assert.strictEqual(diagnostics[0].message, errorMsg);
    },
  );

  test.each(
    'diagnostics for type field values',
    [
      ['actions=read;type=random', 'Invalid resource type "random"'], // invalid resource type
      [
        'type=credential,random;actions=read',
        'Invalid resource type "credential,random"',
      ], // invalid resource type
      ['type=credential-store;actions=read'], // valid grant string
    ],
    function (assert, [grantString, errorMsg]) {
      const diagnostics = this.grantLinter(createContext(grantString));

      if (errorMsg) {
        assert.strictEqual(diagnostics[0].message, errorMsg);
      } else {
        assert.strictEqual(diagnostics.length, 0);
      }
    },
  );

  test.each(
    'diagnostics for actions field values',
    [
      [
        'type=credential;actions=,',
        '"actions" field must contain at least one action',
      ], // actions field must contain at least one action
      [
        'type=credential;actions=read,*,write',
        'Wildcard action "*" cannot be combined with other actions',
      ], // wildcard action cannot be combined with other actions
      [
        'type=credential;actions=execute',
        'Invalid action "execute" for resource type "credential". Valid actions: create, list, read, update, delete',
      ], // invalid action for resource type
      [
        'type=target;actions=execute',
        'Invalid action "execute" for resource type "target". Valid actions: list, create, add-credential-sources, remove-credential-sources, delete, set-host-sources, set-credential-sources, authorize-session, read, update, add-host-sources, remove-host-sources',
      ], // invalid action when type is not specified
      ['type=target;actions=read,add-credential-sources'], // valid actions for resource type
    ],
    function (assert, [grantString, errorMsg]) {
      const diagnostics = this.grantLinter(createContext(grantString));

      if (errorMsg) {
        assert.strictEqual(diagnostics[0].message, errorMsg);
      } else {
        assert.strictEqual(diagnostics.length, 0);
      }
    },
  );

  test.each(
    'diagnostics for ids field values',
    [
      [
        'type=credential;ids=,,,;actions=read',
        '"ids" field must contain at least one id',
      ], // ids field must contain at least one id
      [
        'actions=read;type=credential;ids=cs_1234,*,cs_5678',
        'Wildcard id "*" cannot be combined with other ids',
      ], // wildcard id cannot be combined with other ids
      [
        'ids={{.Account.Id}};type=credential;actions=read',
        'Invalid id "{{.Account.Id}}" for resource type "credential". Valid id prefixes: csst, cs, csvlt',
      ], // template ids not valid with type specified
      [
        'ids={{.Random.Id}};actions=read',
        'Unknown template "{{.Random.Id}}". Valid templates: {{.Account.Id}}, {{.User.Id}}',
      ], // invalid template id
      [
        'type=host-catalog;ids=hcst_1234;actions=list,delete',
        'Resource type "host-catalog" cannot be used for pinning by id',
      ], // only non-top level resource types can be pinned by id
      [
        'type=host-set;ids=hcst_1234,g_1234;actions=read',
        'Invalid id "g_1234" for resource type "host-set". Valid id prefixes: hcst, hc, hcplg',
      ], // all ids must be valid for the resource type
      [
        'type=credential;ids=csst_1234,random;actions=delete',
        'Invalid id "random" for resource type "credential". Valid id prefixes: csst, cs, csvlt',
      ], // all ids must be valid for the resource type
      [
        'ids=cs_1234,g_1234;actions=read',
        'All ids must have the same type. Invalid id "g_1234"',
      ], // all ids must be same type when type is not specified
      ['ids=none_1234,csvlt_123;actions=list', 'Invalid id "none_1234"'], // valid ids prefixes only
      [
        'ids=g_123,amoidc_456;type=*;actions=read,list',
        'Id must support child types. Invalid id "g_123"',
      ], // all ids must support child types when type is wildcard
      [
        'ids=amoidc_456,hcst_123;type=*;actions=read,list',
        'All ids must have the same type. Invalid id "hcst_123"',
      ], // all ids must be the same type when type is wildcard
      ['ids=cs_1234,csst_5678;actions=read'], // valid ids when they are the same type and type is not specified
      ['ids=*;actions=read'], // valid wildcard id
      ['ids=hcst_123,hcplg_456;type=host-set;actions=read'], // valid pinned ids for host-set resource type
      ['ids={{.Account.Id}};actions=read'], // valid template id when type is not specified
      ['ids={{.Account.Id}},{{.User.Id}};actions=read'], // valid template ids when type is not specified
      ['ids=global,o_123;type=scope;actions=list,read'], // valid ids for type scope
      ['ids=csst_1234,csvlt_5678;actions=*'], // valid id prefixes with same type
      ['ids=amldap_123,amoidc_456;type=*;actions=read,list'], // valid ids with wildcard type
    ],
    function (assert, [grantString, errorMsg]) {
      const diagnostics = this.grantLinter(createContext(grantString));

      if (errorMsg) {
        assert.strictEqual(diagnostics[0].message, errorMsg);
      } else {
        assert.strictEqual(diagnostics.length, 0);
      }
    },
  );
});
