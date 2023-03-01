/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | targets | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    target: null,
  };

  const urls = {
    orgScope: null,
    projectScope: null,
    targets: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
    });
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    authenticateSession({});
  });

  test('can navigate to targets with proper authorization', async function (assert) {
    assert.expect(3);
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'list'
      )
    );
    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create'
      )
    );
    assert.dom(`[href="${urls.targets}"]`).exists();
  });

  test('user cannot navigate to index without either list or create actions', async function (assert) {
    assert.expect(3);
    instances.scopes.project.authorized_collection_actions.targets = [];
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'list'
      )
    );
    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create'
      )
    );
    assert
      .dom('[title="Resources"] a:nth-of-type(2)')
      .doesNotIncludeText('Targets');
  });

  test('user can navigate to index with only create action', async function (assert) {
    assert.expect(3);
    instances.scopes.project.authorized_collection_actions.targets =
      instances.scopes.project.authorized_collection_actions.targets.filter(
        (item) => item !== 'list'
      );
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create'
      )
    );
    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'list'
      )
    );
    assert.dom(`[href="${urls.targets}"]`).exists();
  });

  test('user can navigate to index with only list action', async function (assert) {
    assert.expect(3);
    instances.scopes.project.authorized_collection_actions.targets =
      instances.scopes.project.authorized_collection_actions.targets.filter(
        (item) => item !== 'create'
      );
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create'
      )
    );
    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'list'
      )
    );
    assert.dom(`[href="${urls.targets}"]`).exists();
  });
});
