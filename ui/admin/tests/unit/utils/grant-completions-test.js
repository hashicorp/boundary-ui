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
  analyzeGrantString,
  getChildResourceActions,
  getCompatibleResourceTypeForIds,
  normalizeGrantsSchema,
  parseGrantFields,
  parseGrantLine,
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

    this.translate = (key) =>
      this.intl.t(`resources.role.edit-grants.completion-info.${key}`);

    this.idLookup = async () => [];
    this.getIsLoading = () => false;

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
      this.translate,
      this.idLookup,
      this.getIsLoading,
    );
  });

  test.each(
    'field name suggestions',
    {
      'suggest all fields on an empty line': {
        lineText: '',
        expectedLabels: ['ids=', 'type=', 'actions=', 'output_fields='],
      },
      'filter already-used fields from suggestions': {
        lineText: 'ids=*;',
        expectedLabels: ['type=', 'actions=', 'output_fields='],
      },
      'match a partial field name': {
        lineText: 'ty',
        expectedLabels: ['type='],
      },
      'filter multiple already-used fields': {
        lineText: 'ids=*;type=scope;',
        expectedLabels: ['actions=', 'output_fields='],
      },
    },
    function (assert, { lineText, expectedLabels }) {
      const completionResult = this.grantCompletionSource(
        createCompletionContext(lineText),
      );

      assert.deepEqual(getLabels(completionResult), expectedLabels);
    },
  );

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
      '{{.User.Id}} template has no child resource types so shows no suggestions':
        {
          lineText: 'ids={{.User.Id}};type=',
          expectedLabels: ['NO_SUGGESTIONS'],
        },
      '{{.Account.Id}} template has no child resource types so shows no suggestions':
        {
          lineText: 'ids={{.Account.Id}};type=',
          expectedLabels: ['NO_SUGGESTIONS'],
        },
      '{{user.id}} template has no child resource types so shows no suggestions':
        {
          lineText: 'ids={{user.id}};type=',
          expectedLabels: ['NO_SUGGESTIONS'],
        },
      '{{account.id}} template has no child resource types so shows no suggestions':
        {
          lineText: 'ids={{account.id}};type=',
          expectedLabels: ['NO_SUGGESTIONS'],
        },
    },
    async function (assert, { lineText, expectedLabels }) {
      const completionResult = await this.grantCompletionSource(
        createCompletionContext(lineText),
      );
      const resolvedLabels = expectedLabels.map((label) =>
        label === 'NO_SUGGESTIONS' ? this.translate('no-suggestions') : label,
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
      '{{.User.Id}} template without a type suggests user id actions': {
        lineText: 'ids={{.User.Id}};actions=',
        expectedLabels: [
          '*',
          'list-resolvable-aliases',
          'read',
          'update',
          'delete',
          'add-accounts',
          'set-accounts',
          'remove-accounts',
        ],
      },
      '{{.Account.Id}} template without a type suggests account id actions': {
        lineText: 'ids={{.Account.Id}};actions=',
        expectedLabels: [
          '*',
          'set-password',
          'change-password',
          'read',
          'update',
          'delete',
        ],
      },
      '{{user.id}} template without a type suggests user id actions': {
        lineText: 'ids={{user.id}};actions=',
        expectedLabels: [
          '*',
          'list-resolvable-aliases',
          'read',
          'update',
          'delete',
          'add-accounts',
          'set-accounts',
          'remove-accounts',
        ],
      },
      '{{account.id}} template without a type suggests account id actions': {
        lineText: 'ids={{account.id}};actions=',
        expectedLabels: [
          '*',
          'set-password',
          'change-password',
          'read',
          'update',
          'delete',
        ],
      },
      'mixed user and account templates show a no suggestions placeholder': {
        lineText: 'ids={{.User.Id}},{{.Account.Id}};actions=',
        expectedLabels: ['NO_SUGGESTIONS'],
      },
    },
    async function (assert, { lineText, expectedLabels }) {
      const completionResult = await this.grantCompletionSource(
        createCompletionContext(lineText),
      );
      const resolvedLabels = (
        typeof expectedLabels === 'function' ? expectedLabels() : expectedLabels
      ).map((label) =>
        label === 'NO_SUGGESTIONS' ? this.translate('no-suggestions') : label,
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
      'suggest wildcard and templates on an empty ids value': {
        lineText: 'ids=',
        expectedLabels: ['*', '{{.User.Id}}', '{{.Account.Id}}'],
      },
      'filter wildcard once an id is already entered': {
        lineText: 'ids={{.User.Id}},',
        expectedLabels: ['{{.Account.Id}}'],
      },
      'filter already-entered template ids when completing a partial': {
        lineText: 'ids={{.User.Id}},{{',
        expectedLabels: ['{{.Account.Id}}'],
      },
    },
    function (assert, { lineText, expectedLabels }) {
      const completionResult = await this.grantCompletionSource(
        createCompletionContext(lineText),
      );

      assert.deepEqual(getLabels(completionResult), expectedLabels);
    },
  );

  test('completion info labels are translated values', async function (assert) {
    const typeCompletionResult = await this.grantCompletionSource(
      createCompletionContext('type='),
    );
    const idsCompletionResult = await this.grantCompletionSource(
      createCompletionContext('ids='),
    );
    const outputFieldsCompletionResult = await this.grantCompletionSource(
      createCompletionContext('output_fields='),
    );
    const actionsCompletionResult = await this.grantCompletionSource(
      createCompletionContext('actions='),
    );

    assert.strictEqual(
      typeCompletionResult.options[0].info,
      this.translate('wildcard-types'),
    );

    assert.deepEqual(getInfos(idsCompletionResult), [
      this.translate('wildcard-ids'),
      this.translate('template-value'),
      this.translate('template-value'),
    ]);

    assert.strictEqual(
      outputFieldsCompletionResult.options[0].info,
      this.translate('all-fields'),
    );

    assert.strictEqual(
      actionsCompletionResult.options[0].info,
      this.translate('wildcard-actions'),
    );
  });

  test('parseGrantLine extracts all field values from a grant string', function (assert) {
    assert.deepEqual(
      parseGrantLine(
        'ids=s_123;type=session;actions=read,list;output_fields=*',
      ),
      {
        parsedFields: [
          { fieldName: 'ids', fieldValue: 's_123' },
          { fieldName: 'type', fieldValue: 'session' },
          { fieldName: 'actions', fieldValue: 'read,list' },
          { fieldName: 'output_fields', fieldValue: '*' },
        ],
        idsValue: 's_123',
        typeValue: 'session',
        actionsValue: 'read,list',
        outputFieldsValue: '*',
      },
    );
  });

  test('parseGrantLine returns undefined for missing fields', function (assert) {
    const { idsValue, typeValue, actionsValue, outputFieldsValue } =
      parseGrantLine('type=session');

    assert.strictEqual(idsValue, undefined);
    assert.strictEqual(typeValue, 'session');
    assert.strictEqual(actionsValue, undefined);
    assert.strictEqual(outputFieldsValue, undefined);
  });

  test('parseGrantLine returns undefined values for an empty string', function (assert) {
    const { idsValue, typeValue, actionsValue, outputFieldsValue } =
      parseGrantLine('');

    assert.strictEqual(idsValue, undefined);
    assert.strictEqual(typeValue, undefined);
    assert.strictEqual(actionsValue, undefined);
    assert.strictEqual(outputFieldsValue, undefined);
  });

  test('getCompatibleResourceTypeForIds returns the matched type for a known id prefix', function (assert) {
    const schema = normalizeGrantsSchema(this.grantsSchemaData);

    assert.strictEqual(
      getCompatibleResourceTypeForIds(schema, 'hs_123'),
      'host-set',
    );
  });

  test('getCompatibleResourceTypeForIds returns null for an unknown id prefix', function (assert) {
    const schema = normalizeGrantsSchema(this.grantsSchemaData);

    assert.strictEqual(
      getCompatibleResourceTypeForIds(schema, 'bad_123'),
      null,
    );
  });

  test('getCompatibleResourceTypeForIds returns null for mixed resource type ids', function (assert) {
    const schema = normalizeGrantsSchema(this.grantsSchemaData);

    assert.strictEqual(
      getCompatibleResourceTypeForIds(schema, 'hs_123,s_123'),
      null,
    );
  });

  test('getCompatibleResourceTypeForIds returns the type when all ids share the same resource type', function (assert) {
    const schema = normalizeGrantsSchema(this.grantsSchemaData);

    assert.strictEqual(
      getCompatibleResourceTypeForIds(schema, 'hs_123,hs_456'),
      'host-set',
    );
  });

  test('analyzeGrantString.actions returns the same actions as the completion source uses', function (assert) {
    const { actions } = analyzeGrantString(
      this.grantsSchemaData,
      'ids=hcst_1234567890;type=host-set',
    );

    assert.deepEqual(actions, [
      'add-hosts',
      'create',
      'delete',
      'list',
      'read',
      'remove-hosts',
      'set-hosts',
      'update',
    ]);
  });

  test('analyzeGrantString.detectedResourceType returns the type inferred from a specific id', function (assert) {
    const { detectedResourceType } = analyzeGrantString(
      this.grantsSchemaData,
      'ids=hs_123',
    );

    assert.strictEqual(detectedResourceType, 'host-set');
  });

  test('analyzeGrantString.detectedResourceType returns an explicit type value', function (assert) {
    const { detectedResourceType } = analyzeGrantString(
      this.grantsSchemaData,
      'type=session',
    );

    assert.strictEqual(detectedResourceType, 'session');
  });

  test('analyzeGrantString.detectedResourceType returns null when no type can be detected', function (assert) {
    const { detectedResourceType } = analyzeGrantString(
      this.grantsSchemaData,
      'output_fields=*',
    );

    assert.strictEqual(detectedResourceType, null);
  });

  test('analyzeGrantString.detectedResourceType returns null for a wildcard type', function (assert) {
    const { detectedResourceType } = analyzeGrantString(
      this.grantsSchemaData,
      'type=*',
    );

    assert.strictEqual(detectedResourceType, null);
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

  test.each(
    'analyzeGrantString.isWildcard',
    {
      'returns true when ids is wildcard': {
        grantString: 'ids=*',
        expected: true,
      },
      'returns true when type is wildcard': {
        grantString: 'type=*',
        expected: true,
      },
      'returns true when both ids and type are wildcard': {
        grantString: 'ids=*;type=*',
        expected: true,
      },
      'returns false for specific ids': {
        grantString: 'ids=hs_123',
        expected: false,
      },
      'returns false for a specific type': {
        grantString: 'type=host-set',
        expected: false,
      },
    },
    function (assert, { grantString, expected }) {
      const { isWildcard } = analyzeGrantString(
        this.grantsSchemaData,
        grantString,
      );
      assert.strictEqual(isWildcard, expected);
    },
  );

  test.each(
    'analyzeGrantString.hasTemplateIds',
    {
      'returns true for a canonical template id': {
        grantString: 'ids={{.User.Id}}',
        expected: true,
      },
      'returns true when any id in a list is a template': {
        grantString: 'ids={{.Account.Id}}',
        expected: true,
      },
      'returns false for a specific id': {
        grantString: 'ids=hs_123',
        expected: false,
      },
      'returns false for a wildcard id': {
        grantString: 'ids=*',
        expected: false,
      },
      'returns false when there are no ids': {
        grantString: 'type=host-set',
        expected: false,
      },
    },
    function (assert, { grantString, expected }) {
      const { hasTemplateIds } = analyzeGrantString(
        this.grantsSchemaData,
        grantString,
      );
      assert.strictEqual(hasTemplateIds, expected);
    },
  );

  test.each(
    'analyzeGrantString.hasInvalidType',
    {
      'returns true for an unknown type': {
        grantString: 'type=not-a-real-type',
        expected: true,
      },
      'returns false for a known type': {
        grantString: 'type=host-set',
        expected: false,
      },
      'returns false for a wildcard type': {
        grantString: 'type=*',
        expected: false,
      },
      'returns false when there is no type': {
        grantString: 'ids=hs_123',
        expected: false,
      },
    },
    function (assert, { grantString, expected }) {
      const { hasInvalidType } = analyzeGrantString(
        this.grantsSchemaData,
        grantString,
      );
      assert.strictEqual(hasInvalidType, expected);
    },
  );

  test.each(
    'analyzeGrantString.hasInvalidIds',
    {
      'returns true for an unrecognised id prefix': {
        grantString: 'ids=bad_123',
        expected: true,
      },
      'returns true for mixed ids with conflicting resource types': {
        grantString: 'ids=hs_123,s_123',
        expected: true,
      },
      'returns false for a recognised id prefix': {
        grantString: 'ids=hs_123',
        expected: false,
      },
      'returns false for a wildcard id': {
        grantString: 'ids=*',
        expected: false,
      },
      'returns false for a template id': {
        grantString: 'ids={{.User.Id}}',
        expected: false,
      },
    },
    function (assert, { grantString, expected }) {
      const { hasInvalidIds } = analyzeGrantString(
        this.grantsSchemaData,
        grantString,
      );
      assert.strictEqual(hasInvalidIds, expected);
    },
  );

  test.each(
    'analyzeGrantString.hasInvalidPinnedIdTypeCombination',
    {
      'returns true when a pinned id is paired with its own type': {
        grantString: 'ids=hcst_1234567890;type=host-catalog',
        expected: true,
      },
      'returns false when a pinned id is paired with a valid child type': {
        grantString: 'ids=hcst_1234567890;type=host-set',
        expected: false,
      },
      'returns false for wildcard ids with a specific type': {
        grantString: 'ids=*;type=host-set',
        expected: false,
      },
      'returns false when there is no type': {
        grantString: 'ids=hcst_1234567890',
        expected: false,
      },
      'returns false when ids are invalid': {
        grantString: 'ids=bad_123;type=host-set',
        expected: false,
      },
    },
    function (assert, { grantString, expected }) {
      const { hasInvalidPinnedIdTypeCombination } = analyzeGrantString(
        this.grantsSchemaData,
        grantString,
      );
      assert.strictEqual(hasInvalidPinnedIdTypeCombination, expected);
    },
  );
  module('id auto completion', function () {
    test('idLookup results are included alongside static options', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [
          { id: 'ttcp_abc123', name: 'My Target' },
          { id: 'ttcp_def456', name: 'Another Target' },
        ],
        () => false,
      );

      const result = await source(createCompletionContext('ids='));

      const labels = getLabels(result);
      assert.true(labels.includes('*'));
      assert.true(labels.includes('{{.User.Id}}'));
      assert.true(labels.includes('{{.Account.Id}}'));
      assert.true(labels.includes('ttcp_abc123'));
      assert.true(labels.includes('ttcp_def456'));
    });

    test('idLookup results have detail set to the resource name', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [{ id: 'ttcp_abc123', name: 'My Target' }],
        () => false,
      );

      const result = await source(createCompletionContext('ids='));

      const idOption = result.options.find((o) => o.label === 'ttcp_abc123');
      assert.ok(idOption, 'found the ID option');
      assert.strictEqual(idOption.detail, 'My Target');
    });

    test('static options appear before idLookup results', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [{ id: 'ttcp_abc123', name: 'My Target' }],
        () => false,
      );

      const result = await source(createCompletionContext('ids='));
      const labels = getLabels(result);

      assert.true(
        labels.indexOf('*') < labels.indexOf('ttcp_abc123'),
        'wildcard appears before DB results',
      );
    });

    test('loading placeholder is appended when getIsLoading returns true', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [{ id: 'ttcp_abc123', name: 'My Target' }],
        () => true,
      );

      const result = await source(createCompletionContext('ids='));
      const labels = getLabels(result);

      assert.true(labels.includes(this.translate('loading-ids')));
      assert.strictEqual(
        labels.at(-1),
        this.translate('loading-ids'),
        'loading placeholder is the last option',
      );
    });

    test('loading placeholder is NOT present when getIsLoading returns false', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [],
        () => false,
      );

      const result = await source(createCompletionContext('ids='));
      const labels = getLabels(result);

      assert.false(labels.includes(this.translate('loading-ids')));
    });

    test('wildcard and templates are hidden when any IDs are already entered', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [],
        () => false,
      );

      const result = await source(createCompletionContext('ids=ttcp_abc123,'));
      const labels = getLabels(result);

      assert.false(labels.includes('*'));
      assert.false(labels.includes('{{.User.Id}}'));
      assert.false(labels.includes('{{.Account.Id}}'));
    });

    test('templates are hidden when a type field is present, even with no IDs entered', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [],
        () => false,
      );

      const result = await source(createCompletionContext('type=user;ids='));
      const labels = getLabels(result);

      assert.false(labels.includes('{{.User.Id}}'));
      assert.false(labels.includes('{{.Account.Id}}'));
    });

    test('wildcard is still suggested when a type field is present and no IDs are entered', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [],
        () => false,
      );

      const result = await source(createCompletionContext('type=user;ids='));
      const labels = getLabels(result);

      assert.true(labels.includes('*'));
    });

    test('templates are suggested when no type field and no IDs are entered', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [],
        () => false,
      );

      const result = await source(createCompletionContext('ids='));
      const labels = getLabels(result);

      assert.true(labels.includes('{{.User.Id}}'));
      assert.true(labels.includes('{{.Account.Id}}'));
    });

    test('when type=* idLookup is called with all parent resource types', async function (assert) {
      assert.expect(1);

      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async (partial, compatibleResourceTypes) => {
          assert.deepEqual(compatibleResourceTypes, [
            'auth-method',
            'host-catalog',
            'credential-store',
          ]);
          return [];
        },
        () => false,
      );

      await source(createCompletionContext('type=*;ids='));
    });

    test('when type is a child type idLookup is called with the parent type and its results are included', async function (assert) {
      assert.expect(2);

      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async (partial, compatibleResourceTypes) => {
          assert.deepEqual(compatibleResourceTypes, ['host-catalog']);
          return [{ id: 'hcst_parentid', name: 'My Host Catalog' }];
        },
        () => false,
      );

      const result = await source(
        createCompletionContext('type=host-set;ids='),
      );

      assert.true(getLabels(result).includes('hcst_parentid'));
    });

    test('already-entered IDs are not offered again', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [],
        () => false,
      );

      const result = await source(createCompletionContext('ids={{.User.Id}},'));
      const labels = getLabels(result);

      assert.false(labels.includes('{{.User.Id}}'));
    });

    test('empty idLookup result still returns static options', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [],
        () => false,
      );

      const result = await source(createCompletionContext('ids='));

      assert.deepEqual(getLabels(result), [
        '*',
        '{{.User.Id}}',
        '{{.Account.Id}}',
      ]);
    });

    test('partial prefix filters static options correctly', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [],
        () => false,
      );

      const result = await source(createCompletionContext('ids={{'));

      const labels = getLabels(result);
      assert.false(labels.includes('*'), 'wildcard filtered out by prefix');
      assert.deepEqual(labels, ['{{.User.Id}}', '{{.Account.Id}}']);
    });

    test('idLookup is called when partial contains uppercase letters and spaces, enabling name-based search', async function (assert) {
      assert.expect(2);

      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async (partial) => {
          assert.strictEqual(partial, 'My Target');
          return [{ id: 'ttcp_abc123', name: 'My Target' }];
        },
        () => false,
      );

      const result = await source(createCompletionContext('ids=My Target'));
      const labels = getLabels(result);

      assert.true(labels.includes('ttcp_abc123'));
    });

    test('idLookup results with undefined name still work (detail is undefined)', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [{ id: 'ttcp_abc123', name: undefined }],
        () => false,
      );

      const result = await source(createCompletionContext('ids='));
      const idOption = result.options.find((o) => o.label === 'ttcp_abc123');

      assert.ok(idOption);
      assert.strictEqual(idOption.detail, undefined);
    });

    test('idLookup is called with compatibleResourceTypes when entered IDs all share a single resource type', async function (assert) {
      assert.expect(1);

      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async (partial, compatibleResourceTypes) => {
          assert.deepEqual(compatibleResourceTypes, ['target']);
          return [];
        },
        () => false,
      );

      await source(createCompletionContext('ids=ttcp_abc123,'));
    });

    test('no suggestions shown when entered IDs have mixed resource types', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [],
        () => false,
      );

      const result = await source(
        createCompletionContext('ids=ttcp_abc123,hs_456,'),
      );

      assert.deepEqual(getLabels(result), [this.translate('no-suggestions')]);
    });

    test('idLookup results matching already-entered IDs are excluded', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [
          { id: 'ttcp_abc123', name: 'Already Entered' },
          { id: 'ttcp_def456', name: 'New Target' },
        ],
        () => false,
      );

      const result = await source(createCompletionContext('ids=ttcp_abc123,'));
      const labels = getLabels(result);

      assert.false(
        labels.includes('ttcp_abc123'),
        'already-entered ID excluded',
      );
      assert.true(labels.includes('ttcp_def456'), 'new ID included');
    });

    test('no suggestions shown when idLookup returns empty results with entered IDs', async function (assert) {
      const source = createGrantCompletionSource(
        this.grantsSchemaData,
        this.translate,
        async () => [],
        () => false,
      );

      const result = await source(createCompletionContext('ids=ttcp_abc123,'));

      assert.deepEqual(getLabels(result), [this.translate('no-suggestions')]);
    });
  });
});
