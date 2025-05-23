/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  fillIn,
  waitUntil,
  findAll,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | sessions | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const NO_RESULTS_MSG_SELECTOR = '[data-test-no-session-results]';
  const SESSION_ID_SELECTOR = (id) => `[data-test-session="${id}"]`;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
      anotherProject: null,
    },
    sessions: null,
    tcpTarget: null,
    sshTarget: null,
    admin: null,
    dev: null,
  };
  const urls = {
    orgScope: null,
    projectScope: null,
    sessions: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.admin = this.server.create('user', {
      scopeId: 'global',
      name: 'admin',
    });
    instances.dev = this.server.create('user', {
      scopeId: 'global',
      name: 'dev',
    });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: instances.scopes.org.type },
    });
    instances.scopes.project.authorized_collection_actions.users = [
      'create',
      'list',
    ];
    instances.scopes.anotherProject = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: instances.scopes.org.type },
    });
    instances.scopes.anotherProject.authorized_collection_actions.users = [
      'create',
      'list',
    ];
    this.server.createList(
      'group',
      1,
      { scope: instances.scopes.org },
      'withMembers',
    );
    instances.tcpTarget = this.server.create(
      'target',
      { scope: instances.scopes.project, type: TYPE_TARGET_TCP },
      'withAssociations',
    );
    instances.sshTarget = this.server.create(
      'target',
      { scope: instances.scopes.project, type: TYPE_TARGET_SSH },
      'withAssociations',
    );
    instances.sessions = this.server.createList(
      'session',
      3,
      {
        scope: instances.scopes.project,
        status: 'active',
      },
      'withAssociations',
    );
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.sessions = `${urls.projectScope}/sessions`;

    await authenticateSession({ username: 'admin' });
  });

  test('visiting sessions', async function (assert) {
    await visit(urls.projectScope);
    await a11yAudit();

    await click(commonSelectors.HREF(urls.sessions));
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.sessions);
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists({ count: instances.sessions.length });
  });

  test('users cannot navigate to sessions tab without proper authorization', async function (assert) {
    await visit(urls.orgScope);
    await a11yAudit();
    instances.scopes.project.authorized_collection_actions.sessions =
      instances.scopes.project.authorized_collection_actions.sessions.filter(
        (item) => item !== 'list',
      );

    await click(commonSelectors.HREF(urls.projectScope));

    assert.false(
      instances.scopes.project.authorized_collection_actions.sessions.includes(
        'list',
      ),
    );

    assert.dom(commonSelectors.SIDEBAR_NAV_LINK(urls.sessions)).doesNotExist();
  });

  test('users can navigate to sessions with proper authorization', async function (assert) {
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.projectScope));

    assert.true(
      instances.scopes.project.authorized_collection_actions.sessions.includes(
        'list',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.sessions)).exists();
  });

  test('visiting sessions without users or targets is OK', async function (assert) {
    await visit(urls.projectScope);
    instances.sessions[0].update({
      userId: null,
      targetId: null,
    });

    await click(commonSelectors.HREF(urls.sessions));

    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists({ count: instances.sessions.length });
  });

  test('cancelling a session', async function (assert) {
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.sessions));
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('Canceled successfully.');
  });

  test('cancelling a session with error shows notification', async function (assert) {
    await visit(urls.projectScope);
    this.server.post('/sessions/:id_method', () => new Response(400));

    await click(commonSelectors.HREF(urls.sessions));
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);

    assert.dom(commonSelectors.ALERT_TOAST).includesText('Error');
  });

  test('users can link to docs page for sessions', async function (assert) {
    const docsUrl =
      'https://developer.hashicorp.com/boundary/docs/concepts/domain-model/sessions';
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.sessions));

    assert.dom(commonSelectors.HREF(docsUrl)).exists();
  });

  test('user can search for a specific session by id', async function (assert) {
    await visit(urls.projectScope);
    const sessionId = instances.sessions[0].id;

    await click(commonSelectors.HREF(urls.sessions));
    await fillIn(commonSelectors.SEARCH_INPUT, sessionId);
    await waitUntil(() => findAll(SESSION_ID_SELECTOR(sessionId)).length === 1);

    assert.dom(SESSION_ID_SELECTOR(sessionId)).hasText(sessionId);
  });

  test('user can search for sessions and get no results', async function (assert) {
    await visit(urls.projectScope);
    const sessionId = 'fake session that does not exist';

    await click(commonSelectors.HREF(urls.sessions));
    await fillIn(commonSelectors.SEARCH_INPUT, sessionId);
    await waitUntil(() => findAll(NO_RESULTS_MSG_SELECTOR).length === 1);

    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });

  test('user can filter for sessions by user', async function (assert) {
    await visit(urls.projectScope);
    instances.sessions[2].update({
      userId: instances.dev.id,
    });

    await click(commonSelectors.HREF(urls.sessions));
    await click(commonSelectors.FILTER_DROPDOWN('user'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM(instances.dev.id));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('user'));

    assert.dom(SESSION_ID_SELECTOR(instances.sessions[2].id)).exists();
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 1 });
  });

  test('users filter is hidden if no users returned or no list permissions', async function (assert) {
    instances.scopes.global.authorized_collection_actions.users =
      instances.scopes.global.authorized_collection_actions.users.filter(
        (item) => item !== 'list',
      );
    instances.scopes.org.authorized_collection_actions.users =
      instances.scopes.org.authorized_collection_actions.users.filter(
        (item) => item !== 'list',
      );
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.sessions));
    assert.dom(commonSelectors.FILTER_DROPDOWN('user')).doesNotExist();
  });

  test('user can filter for sessions by target', async function (assert) {
    await visit(urls.projectScope);
    instances.sessions[2].update({
      targetId: instances.sshTarget.id,
    });

    await click(commonSelectors.HREF(urls.sessions));
    await click(commonSelectors.FILTER_DROPDOWN('target'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM(instances.sshTarget.id));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('target'));

    assert.dom(SESSION_ID_SELECTOR(instances.sessions[2].id)).exists();
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 1 });
  });

  test('targets filter is hidden if no targets returned or no list permissions', async function (assert) {
    instances.scopes.project.authorized_collection_actions.targets =
      instances.scopes.project.authorized_collection_actions.targets.filter(
        (item) => item !== 'list',
      );
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.sessions));
    assert.dom(commonSelectors.FILTER_DROPDOWN('target')).doesNotExist();
  });

  test('user can filter for sessions by status', async function (assert) {
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.sessions));
    await click(commonSelectors.FILTER_DROPDOWN('status'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM('active'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('status'));

    assert.dom(NO_RESULTS_MSG_SELECTOR).includesText('No results found');
  });

  test('sessions can be loaded after visiting a project without sessions', async function (assert) {
    await visit(`/scopes/${instances.scopes.anotherProject.id}/sessions`);
    assert.dom('[data-test-no-sessions]').includesText('No sessions available');
    await visit(`/scopes/${instances.scopes.project.id}/sessions`);
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists({ count: instances.sessions.length });
  });

  test('sessions show correct user filters when switching projects', async function (assert) {
    this.server.schema.sessions.all().destroy();

    const anotherProject = {
      sessionCount: 4,
      user: instances.dev,
      scope: instances.scopes.anotherProject,
    };

    const project = {
      sessionCount: 2,
      user: instances.admin,
      scope: instances.scopes.project,
    };

    this.server.createList(
      'session',
      anotherProject.sessionCount,
      {
        status: 'active',
        scope: anotherProject.scope,
        user: anotherProject.user,
      },
      'withAssociations',
    );

    instances.sessions = this.server.createList(
      'session',
      project.sessionCount,
      {
        status: 'active',
        scope: project.scope,
        user: project.user,
      },
      'withAssociations',
    );

    await visit(`/scopes/${anotherProject.scope.id}/sessions`);
    await click(commonSelectors.FILTER_DROPDOWN('user'));
    assert
      .dom(commonSelectors.FILTER_DROPDOWN_ITEM(anotherProject.user.id))
      .isVisible();
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists({ count: anotherProject.sessionCount });

    findAll(commonSelectors.TABLE_ROWS).forEach((row) => {
      assert.dom(row).includesText(anotherProject.user.name);
    });

    await visit(`/scopes/${project.scope.id}/sessions`);
    await click(commonSelectors.FILTER_DROPDOWN('user'));
    assert
      .dom(commonSelectors.FILTER_DROPDOWN_ITEM(project.user.id))
      .isVisible();
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists({ count: project.sessionCount });
    findAll(commonSelectors.TABLE_ROWS).forEach((row) => {
      assert.dom(row).includesText(project.user.name);
    });
  });

  test('sessions show correct target filters when switching projects', async function (assert) {
    this.server.schema.sessions.all().destroy();
    this.server.schema.targets.all().destroy();

    const anotherProjectRefs = {
      sessionCount: 4,
      user: instances.dev,
      scope: instances.scopes.anotherProject,
      target: this.server.create(
        'target',
        { scope: instances.scopes.anotherProject, type: TYPE_TARGET_TCP },
        'withAssociations',
      ),
    };

    const projectRefs = {
      sessionCount: 2,
      user: instances.admin,
      scope: instances.scopes.project,
      target: this.server.create(
        'target',
        { scope: instances.scopes.project, type: TYPE_TARGET_TCP },
        'withAssociations',
      ),
    };

    this.server.createList(
      'session',
      anotherProjectRefs.sessionCount,
      {
        status: 'active',
        scope: anotherProjectRefs.scope,
        user: anotherProjectRefs.user,
      },
      'withAssociations',
    );

    instances.sessions = this.server.createList(
      'session',
      projectRefs.sessionCount,
      {
        status: 'active',
        scope: projectRefs.scope,
        user: projectRefs.user,
      },
      'withAssociations',
    );

    await visit(`/scopes/${anotherProjectRefs.scope.id}/sessions`);
    await click(commonSelectors.FILTER_DROPDOWN('target'));
    assert
      .dom(commonSelectors.FILTER_DROPDOWN_ITEM(anotherProjectRefs.target.id))
      .isVisible();
    findAll(commonSelectors.TABLE_ROWS).forEach((row) => {
      assert.dom(row).includesText(anotherProjectRefs.target.name);
    });

    await visit(`/scopes/${projectRefs.scope.id}/sessions`);
    await click(commonSelectors.FILTER_DROPDOWN('target'));
    assert
      .dom(commonSelectors.FILTER_DROPDOWN_ITEM(projectRefs.target.id))
      .isVisible();
    findAll(commonSelectors.TABLE_ROWS).forEach((row) => {
      assert.dom(row).includesText(projectRefs.target.name);
    });
  });
});
