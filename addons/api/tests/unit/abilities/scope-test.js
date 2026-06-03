/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Scope', function (hooks) {
  setupTest(hooks);

  let store;
  let abilitiesService;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    abilitiesService = this.owner.lookup('service:abilities');
  });
  test('it exists', function (assert) {
    const ability = this.owner.lookup('ability:scope');
    assert.ok(ability);
  });

  test('it reflects when a given scope may attach a policy in global scope', function (assert) {
    const model = {
      authorized_actions: ['attach-storage-policy'],
    };
    assert.true(abilitiesService.can('attachStoragePolicy scope', model));
    model.authorized_actions = [];
    assert.false(abilitiesService.can('attachStoragePolicy scope', model));
  });

  test('it reflects when a given scope may remove a policy in org scope', function (assert) {
    const model = {
      authorized_actions: ['detach-storage-policy'],
    };

    assert.true(abilitiesService.can('detachStoragePolicy scope', model));
    model.authorized_actions = [];
    assert.false(abilitiesService.can('detachStoragePolicy scope', model));
  });

  test.each(
    'canSetAliasSuffix reflects scope type and authorized action',
    {
      'project with action': {
        type: 'project',
        authorized_actions: ['set-alias-target-suffix'],
        expected: true,
      },
      'project without action': {
        type: 'project',
        authorized_actions: [],
        expected: false,
      },
      'org with action': {
        type: 'org',
        authorized_actions: ['set-alias-target-suffix'],
        expected: true,
      },
      'org without action': {
        type: 'org',
        authorized_actions: [],
        expected: false,
      },
      'global with action': {
        type: 'global',
        authorized_actions: ['set-alias-target-suffix'],
        expected: false,
      },
    },
    function (assert, { type, authorized_actions, expected }) {
      const scopeModel = store.createRecord('scope', {
        type,
        authorized_actions,
      });
      assert.strictEqual(
        abilitiesService.can('setAliasSuffix scope', scopeModel),
        expected,
      );
    },
  );

  test.each(
    'canRemoveAliasSuffix reflects scope type, authorized action, and suffix presence',
    {
      'project with action and suffix': {
        type: 'project',
        authorized_actions: ['remove-alias-target-suffix'],
        alias_suffix: 'example',
        expected: true,
      },
      'project with action but no suffix': {
        type: 'project',
        authorized_actions: ['remove-alias-target-suffix'],
        alias_suffix: '',
        expected: false,
      },
      'project with suffix but no action': {
        type: 'project',
        authorized_actions: [],
        alias_suffix: 'example',
        expected: false,
      },
      'org with action and suffix': {
        type: 'org',
        authorized_actions: ['remove-alias-target-suffix'],
        alias_suffix: 'example',
        expected: true,
      },
      'org with action but no suffix': {
        type: 'org',
        authorized_actions: ['remove-alias-target-suffix'],
        alias_suffix: '',
        expected: false,
      },
      'global with action and suffix': {
        type: 'global',
        authorized_actions: ['remove-alias-target-suffix'],
        alias_suffix: 'example',
        expected: false,
      },
    },
    function (assert, { type, authorized_actions, alias_suffix, expected }) {
      const scopeModel = store.createRecord('scope', {
        type,
        authorized_actions,
        alias_suffix,
      });
      assert.strictEqual(
        abilitiesService.can('removeAliasSuffix scope', scopeModel),
        expected,
      );
    },
  );

  test.each(
    'canCreateProjectAlias requires project scope with suffix, parent org with suffix, and aliases create action',
    {
      'project with suffix, org with suffix, and create action': {
        projectSuffix: 'example',
        orgSuffix: 'boundary',
        aliasActions: ['create'],
        expected: true,
      },
      'project without suffix, org with suffix, and create action': {
        projectSuffix: '',
        orgSuffix: 'boundary',
        aliasActions: ['create'],
        expected: false,
      },
      'project with suffix, org without suffix, and create action': {
        projectSuffix: 'example',
        orgSuffix: '',
        aliasActions: ['create'],
        expected: false,
      },
      'project with suffix, org with suffix, but no create action': {
        projectSuffix: 'example',
        orgSuffix: 'boundary',
        aliasActions: [],
        expected: false,
      },
    },
    function (assert, { projectSuffix, orgSuffix, aliasActions, expected }) {
      const orgScope = store.push({
        data: {
          id: 'o_1',
          type: 'scope',
          attributes: { type: 'org', alias_suffix: orgSuffix },
        },
      });
      const projectScope = store.push({
        data: {
          id: 'p_1',
          type: 'scope',
          attributes: {
            type: 'project',
            alias_suffix: projectSuffix,
            authorized_collection_actions: { aliases: aliasActions },
          },
        },
      });
      // Wire the project's scope fragment so scopeModel resolves to orgScope.
      projectScope.scope = { scope_id: orgScope.id };

      assert.strictEqual(
        abilitiesService.can('createProjectAlias scope', projectScope),
        expected,
      );
    },
  );

  test.each(
    'canSeeProjectSuffixPrompt is true when the project has permission to set a suffix but none is configured',
    {
      'project with action and no suffix': {
        type: 'project',
        authorized_actions: ['set-alias-target-suffix'],
        alias_suffix: '',
        expected: true,
      },
      'project with action and existing suffix': {
        type: 'project',
        authorized_actions: ['set-alias-target-suffix'],
        alias_suffix: 'example',
        expected: false,
      },
      'project without action and no suffix': {
        type: 'project',
        authorized_actions: [],
        alias_suffix: '',
        expected: false,
      },
      'org with action and no suffix': {
        type: 'org',
        authorized_actions: ['set-alias-target-suffix'],
        alias_suffix: '',
        expected: false,
      },
    },
    function (assert, { type, authorized_actions, alias_suffix, expected }) {
      const scopeModel = store.createRecord('scope', {
        type,
        authorized_actions,
        alias_suffix,
      });
      assert.strictEqual(
        abilitiesService.can('seeProjectSuffixPrompt scope', scopeModel),
        expected,
      );
    },
  );

  test.each(
    'canSeeOrgSuffixPrompt is true when the parent org has permission to set a suffix but none is configured',
    {
      'project whose org has action and no suffix': {
        orgActions: ['set-alias-target-suffix'],
        orgSuffix: '',
        expected: true,
      },
      'project whose org has action and existing suffix': {
        orgActions: ['set-alias-target-suffix'],
        orgSuffix: 'boundary',
        expected: false,
      },
      'project whose org has no action and no suffix': {
        orgActions: [],
        orgSuffix: '',
        expected: false,
      },
    },
    function (assert, { orgActions, orgSuffix, expected }) {
      const orgScope = store.push({
        data: {
          id: 'o_1',
          type: 'scope',
          attributes: {
            type: 'org',
            alias_suffix: orgSuffix,
            authorized_actions: orgActions,
          },
        },
      });
      const projectScope = store.push({
        data: {
          id: 'p_1',
          type: 'scope',
          attributes: { type: 'project' },
        },
      });
      projectScope.scope = { scope_id: orgScope.id };

      assert.strictEqual(
        abilitiesService.can('seeOrgSuffixPrompt scope', projectScope),
        expected,
      );
    },
  );
});
