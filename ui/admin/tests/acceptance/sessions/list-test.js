/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import { faker } from '@faker-js/faker';
import { TYPE_TARGET_SSH, TYPE_TARGET_TCP } from 'api/models/target';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_CANCELING,
  STATUS_SESSION_PENDING,
  STATUS_SESSION_TERMINATED,
} from 'api/models/session';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | sessions | list', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const CREATED_TIME_VALUES_ARRAY = [
    '2020-01-01T00:00:01.010Z',
    '2020-01-01T00:00:10.100Z',
    '2020-01-01T00:10:01.000Z',
    '2020-01-01T01:00:10.000Z',
    '2020-01-01T10:00:00.000Z',
  ];

  const CREATED_TIME_ISO_VALUES_ARRAY = [
    '2020-01-01 00:00:01',
    '2020-01-01 00:00:10',
    '2020-01-01 00:10:01',
    '2020-01-01 01:00:10',
    '2020-01-01 10:00:00',
  ];
  const ID_VALUES_ARRAY = ['i_0001', 'i_0010', 'i_0100', 'i_1000', 'i_10000'];

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
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
    instances.scopes.global = this.server.schema.scopes.find('global');
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
  });

  test('visiting sessions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.sessions));

    assert.strictEqual(currentURL(), urls.sessions);
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists({ count: instances.sessions.length });
  });

  test('users cannot navigate to sessions tab without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);
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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.sessions));
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('Canceled successfully.');
  });

  test('cancelling a session with error shows notification', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);
    this.server.post('/sessions/:id_method', () => new Response(400));

    await click(commonSelectors.HREF(urls.sessions));
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);

    assert.dom(commonSelectors.ALERT_TOAST).includesText('Error');
  });

  test('users can link to docs page for sessions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const docsUrl =
      'https://developer.hashicorp.com/boundary/docs/concepts/domain-model/sessions';
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.sessions));

    assert.dom(commonSelectors.HREF(docsUrl)).exists();
  });

  test('user can search for a specific session by id', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);
    const sessionId = instances.sessions[0].id;

    await click(commonSelectors.HREF(urls.sessions));
    await fillIn(commonSelectors.SEARCH_INPUT, sessionId);
    await waitFor(selectors.TABLE_SESSION_ID(sessionId), { count: 1 });

    assert.dom(selectors.TABLE_SESSION_ID(sessionId)).hasText(sessionId);
  });

  test('user can search for sessions and get no results', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);
    const sessionId = 'fake session that does not exist';

    await click(commonSelectors.HREF(urls.sessions));
    await fillIn(commonSelectors.SEARCH_INPUT, sessionId);
    await waitFor(selectors.NO_RESULTS_MSG, { count: 1 });

    assert.dom(selectors.NO_RESULTS_MSG).includesText('No results found');
  });

  test('user can search for sessions by associated user name', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.sessions[0].update({
      userId: instances.admin.id,
    });
    instances.sessions[1].update({
      userId: instances.dev.id,
    });
    instances.sessions[2].update({
      userId: instances.dev.id,
    });

    await visit(urls.projectScope);
    await click(commonSelectors.HREF(urls.sessions));
    await fillIn(commonSelectors.SEARCH_INPUT, 'dev');
    await waitFor(selectors.TABLE_SESSION_ID(instances.sessions[0].id), {
      count: 0,
    });

    assert.dom(selectors.TABLE_SESSION_ID(instances.sessions[1].id)).exists();
    assert.dom(selectors.TABLE_SESSION_ID(instances.sessions[2].id)).exists();
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 2 });
  });

  test('user can search for sessions by associated target name', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.sessions[0].update({
      targetId: instances.tcpTarget.id,
    });
    instances.sessions[1].update({
      targetId: instances.sshTarget.id,
    });
    instances.sessions[2].update({
      targetId: instances.sshTarget.id,
    });

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.sessions));
    await fillIn(commonSelectors.SEARCH_INPUT, instances.sshTarget.name);
    await waitFor(selectors.TABLE_SESSION_ID(instances.sessions[0].id), {
      count: 0,
    });

    assert.dom(selectors.TABLE_SESSION_ID(instances.sessions[1].id)).exists();
    assert.dom(selectors.TABLE_SESSION_ID(instances.sessions[2].id)).exists();
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 2 });
  });

  test('user can filter for sessions by user', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);
    instances.sessions[2].update({
      userId: instances.dev.id,
    });

    await click(commonSelectors.HREF(urls.sessions));
    await click(commonSelectors.FILTER_DROPDOWN('user'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM(instances.dev.id));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('user'));

    assert.dom(selectors.TABLE_SESSION_ID(instances.sessions[2].id)).exists();
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 1 });
  });

  test('users filter is hidden if no users returned or no list permissions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);
    instances.sessions[2].update({
      targetId: instances.sshTarget.id,
    });

    await click(commonSelectors.HREF(urls.sessions));
    await click(commonSelectors.FILTER_DROPDOWN('target'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM(instances.sshTarget.id));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('target'));

    assert.dom(selectors.TABLE_SESSION_ID(instances.sessions[2].id)).exists();
    assert.dom(commonSelectors.TABLE_ROWS).exists({ count: 1 });
  });

  test('targets filter is hidden if no targets returned or no list permissions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.scopes.project.authorized_collection_actions.targets =
      instances.scopes.project.authorized_collection_actions.targets.filter(
        (item) => item !== 'list',
      );
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.sessions));
    assert.dom(commonSelectors.FILTER_DROPDOWN('target')).doesNotExist();
  });

  test('user can filter for sessions by status', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.sessions));
    await click(commonSelectors.FILTER_DROPDOWN('status'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM('active'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('status'));

    assert.dom(selectors.NO_RESULTS_MSG).includesText('No results found');
  });

  test('sessions table is sorted by `created_time` descending by default', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.schema.sessions.all().destroy();
    const expectedDescendingSort = CREATED_TIME_ISO_VALUES_ARRAY.toReversed();
    faker.helpers.shuffle(CREATED_TIME_VALUES_ARRAY).forEach((value) => {
      this.server.create('session', {
        created_time: value,
        scope: instances.scopes.project,
        status: STATUS_SESSION_ACTIVE,
      });
    });
    await visit(urls.sessions);

    assert
      .dom(commonSelectors.TABLE_ROWS)
      .isVisible({ count: CREATED_TIME_VALUES_ARRAY.length });
    expectedDescendingSort.forEach((expected, index) => {
      // nth-child index starts at 1
      assert.dom(commonSelectors.TABLE_ROW(index + 1)).containsText(expected);
    });
  });

  test.each(
    'sorting',
    {
      'on id': {
        attribute: {
          key: 'id',
          values: ID_VALUES_ARRAY,
        },
        expectedAscendingSort: ID_VALUES_ARRAY,
        column: 1,
      },
      'on created_time': {
        attribute: {
          key: 'created_time',
          values: CREATED_TIME_VALUES_ARRAY,
        },
        expectedAscendingSort: CREATED_TIME_ISO_VALUES_ARRAY,
        column: 4,
      },
      'on status': {
        attribute: {
          key: 'status',
          values: [
            STATUS_SESSION_ACTIVE,
            STATUS_SESSION_CANCELING,
            STATUS_SESSION_PENDING,
            STATUS_SESSION_TERMINATED,
          ],
        },
        expectedAscendingSort: ['Active', 'Canceling', 'Pending', 'Terminated'],
        column: 5,
      },
    },

    async function (assert, input) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-04
            enabled: false,
          },
        },
      });

      this.server.schema.sessions.all().destroy();
      faker.helpers.shuffle(input.attribute.values).forEach((value) => {
        this.server.create('session', {
          [input.attribute.key]: value,
          scope: instances.scopes.project,
        });
      });
      await visit(urls.sessions);

      await click(selectors.CLEAR_FILTERS_BTN);
      // click the sort button to sort in ascending order for provided column key
      await click(commonSelectors.TABLE_SORT_BTN(input.column));

      assert.true(currentURL().includes('sortDirection=asc'));
      assert.true(
        currentURL().includes(`sortAttribute=${input.attribute.key}`),
      );
      assert
        .dom(commonSelectors.TABLE_SORT_BTN_ARROW_UP(input.column))
        .isVisible();
      assert
        .dom(commonSelectors.TABLE_ROWS)
        .isVisible({ count: input.attribute.values.length });
      input.expectedAscendingSort.forEach((expected, index) => {
        // nth-child index starts at 1
        assert.dom(commonSelectors.TABLE_ROW(index + 1)).containsText(expected);
      });

      // click the sort button again to sort in descending order
      await click(commonSelectors.TABLE_SORT_BTN(input.column));

      assert.true(currentURL().includes('sortDirection=desc'));
      assert.true(
        currentURL().includes(`sortAttribute=${input.attribute.key}`),
      );
      assert
        .dom(commonSelectors.TABLE_SORT_BTN_ARROW_DOWN(input.column))
        .isVisible();
      input.expectedAscendingSort.toReversed().forEach((expected, index) => {
        // nth-child index starts at 1
        assert.dom(commonSelectors.TABLE_ROW(index + 1)).containsText(expected);
      });
    },
  );
});
