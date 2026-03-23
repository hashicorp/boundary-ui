/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'admin/tests/helpers/mirage';

import { createGrantCompletionSource } from 'admin/utils/grant-completions';

const createCompletionContext = (lineText) => ({
  pos: lineText.length,
  state: {
    doc: {
      lineAt() {
        return {
          text: lineText,
          from: 0,
        };
      },
    },
  },
});

const getLabels = (completionResult) =>
  completionResult.options.map(({ label }) => label);

const allActionLabels = [
  '*',
  'create',
  'list',
  'change-state',
  'authenticate',
  'read',
  'update',
  'delete',
  'set-password',
  'change-password',
  'read:self',
  'cancel',
  'cancel:self',
  'list-resolvable-aliases',
  'add-accounts',
  'set-accounts',
  'remove-accounts',
  'delete:self',
  'add-credential-sources',
  'remove-credential-sources',
  'set-host-sources',
  'set-credential-sources',
  'authorize-session',
  'add-host-sources',
  'remove-host-sources',
  'create:controller-led',
  'create:worker-led',
  'read-certificate-authority',
  'reinitialize-certificate-authority',
  'set-worker-tags',
  'remove-worker-tags',
  'add-worker-tags',
  'add-members',
  'set-members',
  'remove-members',
  'add-grant-scopes',
  'add-principals',
  'add-grants',
  'set-grant-scopes',
  'remove-grant-scopes',
  'set-principals',
  'remove-principals',
  'set-grants',
  'remove-grants',
  'add-hosts',
  'set-hosts',
  'remove-hosts',
  'monthly-active-users',
  'destroy-key-version',
  'list-keys',
  'rotate-keys',
  'list-key-version-destruction-jobs',
  'attach-storage-policy',
  'detach-storage-policy',
  'download',
  'reapply-storage-policy',
];

module('Unit | Utils | grant-completions', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(async function () {
    this.intl = this.owner.lookup('service:intl');
    this.noSuggestionsLabel = this.intl.t(
      'resources.role.edit-grants.no-suggestions',
    );

    const response = await fetch('/grants-schema.json');

    if (!response.ok) {
      throw new Error(`Failed to fetch grants schema: ${response.status}`);
    }

    const grantsSchemaData = await response.json();

    this.grantCompletionSource = createGrantCompletionSource(
      grantsSchemaData,
      this.noSuggestionsLabel,
    );
  });

  test.each(
    'type suggestions',
    {
      'without ids only include top-level collection resource types': {
        lineText: 'type=',
        expectedLabels: [
          '*',
          'auth-method',
          'session',
          'credential-store',
          'alias',
          'user',
          'auth-token',
          'target',
          'worker',
          'group',
          'role',
          'host-catalog',
          'storage-bucket',
          'policy',
          'billing',
          'scope',
          'session-recording',
        ],
      },
      'with specific ids only include child resource types': {
        lineText: 'ids=hcst_1234567890;type=',
        expectedLabels: ['*', 'host', 'host-set'],
      },
      'with specific ids and no child resources show a no suggestions placeholder':
        {
          lineText: 'ids=hs_123;type=',
          expectedLabels: ['NO_SUGGESTIONS'],
        },
      'with mixed resource ids show a no suggestions placeholder': {
        lineText: 'ids=hs_123,s_123;type=',
        expectedLabels: ['NO_SUGGESTIONS'],
      },
      'with specific ids and a partial type with no child resources show a no suggestions placeholder':
        {
          lineText: 'ids=hs_123;type=h',
          expectedLabels: ['NO_SUGGESTIONS'],
        },
    },
    function (assert, { lineText, expectedLabels }) {
      const completionResult = this.grantCompletionSource(
        createCompletionContext(lineText),
      );
      const resolvedLabels = expectedLabels.map((label) =>
        label === 'NO_SUGGESTIONS' ? this.noSuggestionsLabel : label,
      );

      assert.deepEqual(getLabels(completionResult), resolvedLabels);
    },
  );

  test.each(
    'action suggestions',
    {
      'type-only grants only suggest collection actions for top-level resource types':
        {
          lineText: 'type=scope;actions=',
          expectedLabels: [
            'destroy-key-version',
            'create',
            'list',
            'list-keys',
            'rotate-keys',
            'list-key-version-destruction-jobs',
          ],
        },
      'type-only grants suggest nothing for child resource types': {
        lineText: 'type=host;actions=',
        expectedLabels: ['NO_SUGGESTIONS'],
      },
      'specific ids without a type only suggest id actions for the resource type':
        {
          lineText: 'ids=hs_123;actions=',
          expectedLabels: [
            '*',
            'delete',
            'add-hosts',
            'set-hosts',
            'remove-hosts',
            'read',
            'update',
          ],
        },
      'comma-separated ids of the same resource type suggest that type id actions':
        {
          lineText: 'ids=hs_123,hs_456;actions=',
          expectedLabels: [
            '*',
            'delete',
            'add-hosts',
            'set-hosts',
            'remove-hosts',
            'read',
            'update',
          ],
        },
      'ids with a matching type suggest all actions for that type': {
        lineText: 'ids=s_123;type=session;actions=',
        expectedLabels: [
          '*',
          'list',
          'read',
          'read:self',
          'cancel',
          'cancel:self',
        ],
      },
      'ids that conflict with the selected type show a no suggestions placeholder':
        {
          lineText: 'ids=hs_123;type=session;actions=',
          expectedLabels: ['NO_SUGGESTIONS'],
        },
      'comma-separated ids with conflicting resource types show a no suggestions placeholder':
        {
          lineText: 'ids=hs_123,s_123;actions=',
          expectedLabels: ['NO_SUGGESTIONS'],
        },
      'wildcard ids with a specific child resource type suggest that type actions':
        {
          lineText: 'ids=*;type=host-set;actions=',
          expectedLabels: [
            '*',
            'create',
            'list',
            'delete',
            'add-hosts',
            'set-hosts',
            'remove-hosts',
            'read',
            'update',
          ],
        },
      'ids that are a top level resource that has child resources with a wildcard type suggest the union of child resource actions':
        {
          lineText: 'ids=hcst_1234567890;type=*;actions=',
          expectedLabels: [
            '*',
            'create',
            'list',
            'read',
            'update',
            'delete',
            'add-hosts',
            'set-hosts',
            'remove-hosts',
          ],
        },
      'ids from different parent resource types with a wildcard type show a no suggestions placeholder':
        {
          lineText: 'ids=hcst_1234567890,o_123;type=*;actions=',
          expectedLabels: ['NO_SUGGESTIONS'],
        },
      'wildcard ids without a type suggest all actions': {
        lineText: 'ids=*;actions=',
        expectedLabels: allActionLabels,
      },
      'wildcard ids with a wildcard type suggest all actions': {
        lineText: 'ids=*;type=*;actions=',
        expectedLabels: allActionLabels,
      },
      'template ids without a type show a no suggestions placeholder': {
        lineText: 'ids={{user.id}};actions=',
        expectedLabels: ['NO_SUGGESTIONS'],
      },
    },
    function (assert, { lineText, expectedLabels }) {
      const completionResult = this.grantCompletionSource(
        createCompletionContext(lineText),
      );
      const resolvedLabels = expectedLabels.map((label) =>
        label === 'NO_SUGGESTIONS' ? this.noSuggestionsLabel : label,
      );

      assert.deepEqual(getLabels(completionResult), resolvedLabels);
    },
  );

  test.each(
    'ids suggestions',
    {
      'include supported template values': {
        lineText: 'ids={{',
        expectedLabels: ['{{.User.Id}}', '{{.Account.Id}}'],
      },
    },
    function (assert, { lineText, expectedLabels }) {
      const completionResult = this.grantCompletionSource(
        createCompletionContext(lineText),
      );

      assert.deepEqual(getLabels(completionResult), expectedLabels);
    },
  );
});
