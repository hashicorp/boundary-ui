/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'admin/tests/helpers/mirage';
import { setupIntl } from 'ember-intl/test-support';
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
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(async function () {
    const response = await fetch('/grants-schema.json');

    if (!response.ok) {
      throw new Error(`Failed to fetch grants schema: ${response.status}`);
    }
    this.intl = this.owner.lookup('service:intl');
    const grantsSchemaData = await response.json();
    const translateLintingError = (key, options = {}) =>
      this.intl.t(`resources.role.edit-grants.linting-errors.${key}`, options);
    this.grantLinter = createGrantLinter(
      grantsSchemaData,
      translateLintingError,
    );
  });

  test.each(
    'diagnostics for syntax and formatting errors',
    [
      ['ids=*; type=*; actions=*', 'Whitespace is not allowed'], // whitespace around semicolons
      ['ids=*;type= *;actions=*', 'Whitespace is not allowed'], // whitespace around equal sign
      ['ids=*;type=*;actions=read, write', 'Whitespace is not allowed'], // whitespace around commas
      ['ids=*;type=*;actions=read,write;', 'Trailing semicolon is not allowed'], // trailing semicolon
      [';ids=*;type=*;actions=read,write', 'Leading semicolon is not allowed'], // leading semicolon
      ['ids={{.Account.Id}};type=+;actions=read', 'Invalid character "+"'], // invalid character +
      ['ids={{.Account.Id}};type=();actions=read', 'Invalid character "("'], // invalid characters ()
      ['type=target', 'Missing "actions" or "output_fields" fields'], // missing actions/output_fields field
      ['actions=read,write', 'Missing "ids" or "type" fields'], // missing type/ids field
      ['ids=hc_123', 'Missing "actions" field'], // missing actions field
      [
        'type=credential-store;ids=;actions=read',
        '"ids" value cannot be empty',
      ], // empty ids value
      ['type=;actions=read', '"type" value cannot be empty'], // empty type field
      ['ids=csst_1234;actions=', '"actions" value cannot be empty'], // empty actions value
      [
        'type=credential;ids=csst_1234;actions=read,write;ids=cs_5678',
        'Duplicate field "ids"',
      ], // duplicate ids field
      [
        'type=credential;actions=read,write;type=host',
        'Duplicate field "type"',
      ], // duplicate type field
      [
        'type=credential;ids=csst_1234;actions=read,write;actions=delete',
        'Duplicate field "actions"',
      ], // duplicate actions field
      [
        'type=credential;ids=cs_1234;actions=read;random=name',
        'Unknown field "random"',
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
      ['actions=read;type=account', 'Type "account" is not a top-level type'], // invalid resource type
      [
        'type=credential,random;actions=read',
        'Invalid resource type "credential,random"',
      ], // invalid resource type
      ['ids=*;actions=read', 'Missing "type" field for wildcard ids'], // missing type field with wildcard id
      ['type=credential-store;actions=create'], // valid grant string
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
      ['type=credential-store;actions=,', 'Invalid syntax'],
      [
        'type=session;actions=read,*,write',
        'Wildcard action "*" cannot be combined with other actions',
      ], // wildcard action cannot be combined with other actions
      [
        'type=policy;actions=execute',
        'Only collection actions are allowed. Invalid action "execute"',
      ], // invalid action for resource type
      [
        'type=target;actions=list,no-op',
        'Only collection actions are allowed. Invalid action "no-op"',
      ], // invalid action when type is not specified
      ['ids=ampw_1234;type=*;actions=read,read', 'Duplicate action "read"'], // duplicate action
      [
        'ids=cs_1234;actions=create',
        'Only id actions for "credential-store" type are allowed. Invalid action "create"',
      ], // invalid action for specific resource
      [
        'ids=*;type=auth-method;actions=no-op',
        '"no-op" action should only be used with "list" action',
      ],
      [
        'ids=ampw_098;type=account;actions=list',
        '"list" action should be used with "no-op" action to have an effect',
      ],
      [
        'ids=*;type=account;actions=list',
        '"list" action should be used with "no-op" action to have an effect',
      ],
      [
        'ids=ampw_098;type=account;actions=list,read,no-op',
        '"no-op" action is unnecessary when other actions are specified',
      ],
      ['ids=hc_1234;type=*;actions=add-hosts,read'], // valid actions for resource type
      ['type=worker;actions=create:controller-led'], // valid actions for resource type
      ['type=auth-method;actions=list'], // valid actions for resource type
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
      ['type=credential;ids=,,,;actions=read', 'Invalid syntax'],
      ['ids=cs_1234,cs_1234;actions=read', 'Duplicate id "cs_1234"'], // duplicate ids
      [
        'ids={{.Account.Id}},{{.Account.Id}};actions=read',
        'Duplicate id "{{.Account.Id}}"',
      ], // duplicate template ids
      [
        'ids={{.Account.Id}},{{account.id}};actions=read',
        'Duplicate id "{{.Account.Id}}" and "{{account.id}}"',
      ], // duplicate template ids
      [
        'ids={{.User.Id}},{{user.id}};actions=read',
        'Duplicate id "{{.User.Id}}" and "{{user.id}}"',
      ], // duplicate template ids
      [
        'actions=read;type=credential;ids=cs_1234,*,cs_5678',
        'Wildcard id "*" cannot be combined with other ids',
      ], // wildcard id cannot be combined with other ids
      [
        'ids={{.Account.Id}};type=credential;actions=read',
        'Pinned IDs must be "credential-store" ids. Invalid id "{{.Account.Id}}"',
      ], // template ids not valid with type specified
      [
        'ids=hsst_1234;type=*;actions=read',
        'Pinned IDs must support child types. Invalid id "hsst_1234"',
      ], // template ids not valid with type specified
      ['ids={{.Random.Id}};actions=read', 'Unknown template "{{.Random.Id}}"'], // invalid template id
      [
        'type=host-catalog;ids=hcst_1234;actions=list,delete',
        'Type "host-catalog" is not a child type of the pinned ID',
      ], // only non-top level resource types can be pinned by id
      [
        'type=host-set;ids=hcst_1234,g_1234;actions=read',
        'Ids do not have the same type. Invalid id "g_1234"',
      ], // all ids must be valid for the resource type
      [
        'type=credential;ids=csst_1234,random;actions=delete',
        'Invalid id "random"',
      ], // all ids must be valid for the resource type
      [
        'ids=cs_1234,g_1234;actions=read',
        'Ids do not have the same type. Invalid id "g_1234"',
      ], // all ids must be same type when type is not specified
      ['ids=none_1234,csvlt_123;actions=list', 'Invalid id "none_1234"'], // valid ids prefixes only
      [
        'ids=g_123,amoidc_456;type=*;actions=read,list',
        'Pinned IDs must support child types. Invalid id "g_123"',
      ], // all ids must support child types when type is wildcard
      [
        'ids=amoidc_456,hcst_123;type=*;actions=read,list',
        'Ids do not have the same type. Invalid id "hcst_123"',
      ], // all ids must be the same type when type is wildcard
      ['ids=cs_1234,csst_5678;actions=read'], // valid ids when they are the same type and type is not specified
      ['ids=*;type=*;actions=read'], // valid wildcard id
      ['ids=hcst_123,hcplg_456;type=host-set;actions=read'], // valid pinned ids for host-set resource type
      ['ids={{.Account.Id}};actions=read'], // valid template id when type is not specified
      [
        'ids={{.Account.Id}},{{.User.Id}};actions=read',
        'Template ids cannot be combined with each other',
      ], // mixed template ids is not allowed
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

  test.each(
    'diagnostics for output_fields field values',
    [
      ['type=target;output_fields=,', 'Invalid syntax'],
      [
        'type=target;output_fields=*,id',
        'Wildcard output field "*" cannot be combined with other fields',
      ],
      ['type=target;output_fields=id,id', 'Duplicate output field "id"'],
      [
        'type=target;output_fields=invalid_field',
        'Invalid output field "invalid_field" for type "target"',
      ],
      [
        'ids=ttcp_123;output_fields=member_ids',
        'Invalid output field "member_ids" for type "target"',
      ],
      ['ids=hcst_123;type=*;actions=read;output_fields=host_catalog_id'], // valid: child type (host) output field
      ['ids=hcst_123;type=*;actions=read;output_fields=host_set_ids'], // valid: child type (host) output field
      [
        'ids=hcst_123;type=*;actions=read;output_fields=session_max_seconds',
        'Invalid output field "session_max_seconds"',
      ], // invalid: not a host or host-set field
      [
        'ids=*;type=*;actions=read;output_fields=id',
        'Invalid output field "id"',
      ], // no specific type context, specific field is invalid
      ['type=target;output_fields=id,name'], // valid output fields
      ['type=target;output_fields=*'], // valid wildcard
      ['ids=ttcp_123;output_fields=scope_id'], // valid inferred type
      ['ids={{.User.Id}};output_fields=email'], // valid user template output field
      ['ids={{user.id}};output_fields=email'], // valid user template alias output field
      ['ids={{.Account.Id}};output_fields=auth_method_id'], // valid account template output field
      ['ids={{account.id}};output_fields=auth_method_id'], // valid account template alias output field
      [
        'ids={{.User.Id}};output_fields=auth_method_id',
        'Invalid output field "auth_method_id" for type "user"',
      ], // account field is invalid for user template
      [
        'ids={{.Account.Id}};output_fields=email',
        'Invalid output field "email" for type "account"',
      ], // user field is invalid for account template
      [
        'ids={{.User.Id}},{{.Account.Id}};output_fields=email',
        'Template ids cannot be combined with each other',
      ], // ids error fires first; mixed templates are disallowed
      [
        'ids={{.User.Id}},{{.Account.Id}};output_fields=auth_method_id',
        'Template ids cannot be combined with each other',
      ], // ids error fires first; mixed templates are disallowed
      [
        'ids={{.User.Id}},{{.Account.Id}};output_fields=session_max_seconds',
        'Template ids cannot be combined with each other',
      ], // ids error fires first; mixed templates are disallowed
      ['type=target;output_fields=id,scope_id,name'], // valid multiple output fields
      ['ids=*;type=*;actions=read;output_fields=*'], // wildcard output fields with wildcard type is valid
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
