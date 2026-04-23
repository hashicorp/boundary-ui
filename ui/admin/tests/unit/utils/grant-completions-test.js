/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'admin/tests/helpers/mirage';

import {
  createGrantCompletionSource,
  getChildResourceActions,
  getSuggestedActionsForGrantLine,
  normalizeGrantsSchema,
  parseGrantFields,
} from 'admin/utils/grant-completions';

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
const getInfos = (completionResult) =>
  completionResult.options.map(({ info }) => info ?? '');

let allActionLabels;

module('Unit | Utils | grant-completions', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(async function () {
    this.intl = this.owner.lookup('service:intl');
    this.completionTranslatedStrings = {
      noSuggestions: this.intl.t('resources.role.edit-grants.no-suggestions'),
      wildcardTypes: this.intl.t(
        'resources.role.edit-grants.completion-info.wildcard-types',
      ),
      wildcardIds: this.intl.t(
        'resources.role.edit-grants.completion-info.wildcard-ids',
      ),
      wildcardActions: this.intl.t(
        'resources.role.edit-grants.completion-info.wildcard-actions',
      ),
      templateValue: this.intl.t(
        'resources.role.edit-grants.completion-info.template-value',
      ),
      allFields: this.intl.t(
        'resources.role.edit-grants.completion-info.all-fields',
      ),
    };
    this.noSuggestionsLabel = this.completionTranslatedStrings.noSuggestions;

    const response = await fetch('/grants-schema.json');

    if (!response.ok) {
      throw new Error(`Failed to fetch grants schema: ${response.status}`);
    }

    const grantsSchemaData = await response.json();
    this.grantsSchemaData = grantsSchemaData;
    allActionLabels = grantsSchemaData.resource_types.reduce(
      (labels, resource) => {
        const resourceLabels = [
          ...(resource.collection_actions ?? []),
          ...(resource.id_actions ?? []),
        ];
        return [...new Set([...labels, ...resourceLabels])];
      },
      [],
    );
    allActionLabels = ['*', ...allActionLabels];

    this.grantCompletionSource = createGrantCompletionSource(
      grantsSchemaData,
      this.completionTranslatedStrings,
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
          'scope',
          'session-recording',
        ],
      },
      'with specific ids only include child resource types': {
        lineText: 'ids=hcst_1234567890;type=',
        expectedLabels: ['*', 'host', 'host-set'],
      },
      'with a partial id prefix include child resource types for the matched parent':
        {
          lineText: 'ids=hcs;type=',
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
      'ids with a matching type show a no suggestions placeholder': {
        lineText: 'ids=s_123;type=session;actions=',
        expectedLabels: ['NO_SUGGESTIONS'],
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
      'pinned ids with a specific child resource type suggest that type actions':
        {
          lineText: 'ids=hcst_1234567890;type=host-set;actions=',
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
      'a partial parent id prefix with a wildcard type suggests child resource actions':
        {
          lineText: 'ids=hcs;type=*;actions=',
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
      'a partial parent id prefix with the same type shows a no suggestions placeholder':
        {
          lineText: 'ids=hcs;type=host-catalog;actions=',
          expectedLabels: ['NO_SUGGESTIONS'],
        },
      'ids from different parent resource types with a wildcard type show a no suggestions placeholder':
        {
          lineText: 'ids=hcst_1234567890,o_123;type=*;actions=',
          expectedLabels: ['NO_SUGGESTIONS'],
        },
      'wildcard ids without a type suggest all actions': {
        lineText: 'ids=*;actions=',
        expectedLabels: () => allActionLabels,
      },
      'wildcard ids with a wildcard type suggest all actions': {
        lineText: 'ids=*;type=*;actions=',
        expectedLabels: () => allActionLabels,
      },
      'canonical template ids without a type show a no suggestions placeholder':
        {
          lineText: 'ids={{.User.Id}};actions=',
          expectedLabels: ['NO_SUGGESTIONS'],
        },
    },
    function (assert, { lineText, expectedLabels }) {
      const completionResult = this.grantCompletionSource(
        createCompletionContext(lineText),
      );
      const resolvedLabels = (
        typeof expectedLabels === 'function' ? expectedLabels() : expectedLabels
      ).map((label) =>
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

  test('completion info labels are translated values', function (assert) {
    const typeCompletionResult = this.grantCompletionSource(
      createCompletionContext('type='),
    );
    const idsCompletionResult = this.grantCompletionSource(
      createCompletionContext('ids='),
    );
    const outputFieldsCompletionResult = this.grantCompletionSource(
      createCompletionContext('output_fields='),
    );
    const actionsCompletionResult = this.grantCompletionSource(
      createCompletionContext('actions='),
    );

    assert.strictEqual(
      typeCompletionResult.options[0].info,
      this.completionTranslatedStrings.wildcardTypes,
    );

    assert.deepEqual(getInfos(idsCompletionResult), [
      this.completionTranslatedStrings.wildcardIds,
      this.completionTranslatedStrings.templateValue,
      this.completionTranslatedStrings.templateValue,
    ]);

    assert.strictEqual(
      outputFieldsCompletionResult.options[0].info,
      this.completionTranslatedStrings.allFields,
    );

    assert.strictEqual(
      actionsCompletionResult.options[0].info,
      this.completionTranslatedStrings.wildcardActions,
    );
  });

  test('parseGrantFields preserves values that contain additional equals signs', function (assert) {
    assert.deepEqual(
      parseGrantFields('ids=s_123;type=session=a;actions=read'),
      [
        { fieldName: 'ids', fieldValue: 's_123' },
        { fieldName: 'type', fieldValue: 'session=a' },
        { fieldName: 'actions', fieldValue: 'read' },
      ],
    );
  });

  test('getChildResourceActions returns the union of child resource actions for a pinned parent id', function (assert) {
    const schema = normalizeGrantsSchema(this.grantsSchemaData);

    assert.deepEqual(getChildResourceActions(schema, 'hcst_1234567890'), [
      'create',
      'list',
      'read',
      'update',
      'delete',
      'add-hosts',
      'set-hosts',
      'remove-hosts',
    ]);
  });

  test('getSuggestedActionsForGrantLine derives the same action set the editor uses', function (assert) {
    assert.deepEqual(
      getSuggestedActionsForGrantLine(
        this.grantsSchemaData,
        'ids=hcst_1234567890;type=host-set',
      ),
      [
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
    );
  });
});
