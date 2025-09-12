/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  click,
  fillIn,
  waitFor,
  currentRouteName,
  currentURL,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  TYPE_TARGET_TCP,
  TYPE_TARGET_SSH,
  TYPE_TARGET_RDP,
} from 'api/models/target';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_TERMINATED,
} from 'api/models/session';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { faker } from '@faker-js/faker';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | targets | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  let featuresService;
  const NAME_VALUES_ARRAY = ['Alpha', 'Beta', 'Delta', 'Epsilon', 'Gamma'];
  const ID_VALUES_ARRAY = ['i_0001', 'i_0010', 'i_0100', 'i_1000', 'i_10000'];
  const CREATED_TIME_VALUES_ARRAY = [
    '2020-01-01T00:01:00.000Z',
    '2020-01-01T00:00:10.000Z',
    '2020-01-01T00:00:01.000Z',
    '2020-01-01T00:00:00.100Z',
    '2020-01-01T00:00:00.010Z',
  ];

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    tcpTarget: null,
    sshTarget: null,
    session: null,
    rdpTarget: null,
  };

  const urls = {
    orgScope: null,
    projectScope: null,
    targets: null,
    sessions: null,
    tcpTarget: null,
    sshTarget: null,
    rdpTarget: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.tcpTarget = this.server.create('target', {
      type: TYPE_TARGET_TCP,
      scope: instances.scopes.project,
    });
    instances.sshTarget = this.server.create('target', {
      id: 'target-0',
      type: TYPE_TARGET_SSH,
      scope: instances.scopes.project,
    });
    instances.session = this.server.create('session', {
      targetId: instances.sshTarget.id,
      scope: instances.scopes.project,
      status: STATUS_SESSION_ACTIVE,
    });
    instances.rdpTarget = this.server.create('target', {
      type: TYPE_TARGET_RDP,
      scope: instances.scopes.project,
    });
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.sessions = `${urls.projectScope}/sessions`;
    urls.tcpTarget = `${urls.targets}/${instances.tcpTarget.id}`;
    urls.sshTarget = `${urls.targets}/${instances.sshTarget.id}`;
    urls.rdpTarget = `${urls.targets}/${instances.rdpTarget.id}`;

    featuresService = this.owner.lookup('service:features');
    featuresService.enable('ssh-target');
    featuresService.enable('rdp-target');

    await authenticateSession({});
  });

  test('can navigate to targets with proper authorization', async function (assert) {
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
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'list',
      ),
    );
    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.targets)).isVisible();
  });

  test('user cannot navigate to index without either list or create actions', async function (assert) {
    instances.scopes.project.authorized_collection_actions.targets = [];
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.projectScope));

    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'list',
      ),
    );
    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    assert
      .dom(commonSelectors.SIDEBAR_NAV_CONTENT)
      .doesNotIncludeText('Targets');
  });

  test('user can navigate to index with only create action', async function (assert) {
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
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.projectScope));

    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'list',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.targets)).isVisible();
  });

  test('user can navigate to index with only list action', async function (assert) {
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
        (item) => item !== 'create',
      );
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.projectScope));

    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'list',
      ),
    );
    assert.dom(commonSelectors.HREF(urls.targets)).isVisible();
  });

  test('user can search for a specific target by id', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.targets));

    assert.dom(commonSelectors.HREF(urls.tcpTarget)).isVisible();
    assert.dom(commonSelectors.HREF(urls.sshTarget)).isVisible();
    assert.dom(commonSelectors.HREF(urls.rdpTarget)).isVisible();

    await fillIn(commonSelectors.SEARCH_INPUT, instances.sshTarget.id);
    await waitFor(commonSelectors.HREF(urls.tcpTarget), { count: 0 });
    await waitFor(commonSelectors.HREF(urls.rdpTarget), { count: 0 });

    assert.dom(commonSelectors.HREF(urls.sshTarget)).isVisible();
    assert.dom(commonSelectors.HREF(urls.tcpTarget)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.rdpTarget)).doesNotExist();
  });

  test('user can search for targets and get no results', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.targets));

    assert.dom(commonSelectors.HREF(urls.tcpTarget)).isVisible();
    assert.dom(commonSelectors.HREF(urls.sshTarget)).isVisible();
    assert.dom(commonSelectors.HREF(urls.rdpTarget)).isVisible();

    await fillIn(
      commonSelectors.SEARCH_INPUT,
      'fake target that does not exist',
    );
    await waitFor(selectors.NO_RESULTS_MSG, { count: 1 });

    assert.dom(commonSelectors.HREF(urls.sshTarget)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.tcpTarget)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.rdpTarget)).doesNotExist();
    assert.dom(selectors.NO_RESULTS_MSG).includesText('No results found');
  });

  test('user can filter for targets by type', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.targets));

    assert.dom(commonSelectors.HREF(urls.tcpTarget)).isVisible();
    assert.dom(commonSelectors.HREF(urls.sshTarget)).isVisible();
    assert.dom(commonSelectors.HREF(urls.rdpTarget)).isVisible();

    await click(commonSelectors.FILTER_DROPDOWN('type'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM('tcp'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('type'));

    assert.dom(commonSelectors.HREF(urls.sshTarget)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.rdpTarget)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.tcpTarget)).isVisible();
  });

  test('user can filter for targets by active sessions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.targets));

    assert.dom(commonSelectors.HREF(urls.tcpTarget)).isVisible();
    assert.dom(commonSelectors.HREF(urls.sshTarget)).isVisible();

    await click(commonSelectors.FILTER_DROPDOWN('active-sessions'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM('yes'));
    await click(
      commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('active-sessions'),
    );

    assert.dom(commonSelectors.HREF(urls.sshTarget)).isVisible();
    assert.dom(commonSelectors.HREF(urls.tcpTarget)).doesNotExist();
  });

  test('active sessions filter is hidden if user does not have permission to list sessions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.scopes.project.authorized_collection_actions.sessions =
      instances.scopes.project.authorized_collection_actions.sessions.filter(
        (item) => item !== 'list',
      );
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.targets));

    assert
      .dom(commonSelectors.FILTER_DROPDOWN('active-sessions'))
      .doesNotExist();
  });

  test('active sessions are refreshed when visiting the targets list page', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    await visit(urls.targets);

    assert.strictEqual(
      instances.session.targetId,
      instances.sshTarget.id,
      'session is associated with correct target',
    );
    const emberDataSessionModel = this.owner
      .lookup('service:store')
      .peekRecord('session', instances.session.id);
    assert.strictEqual(
      emberDataSessionModel.status,
      STATUS_SESSION_ACTIVE,
      'ember data session model is active',
    );

    assert
      .dom(selectors.TABLE_TARGETS_ROW(instances.sshTarget.id))
      .exists('the target is listed in the table');
    assert
      .dom(selectors.TABLE_ACTIVE_SESSIONS(instances.sshTarget.id))
      .includesText('Yes', 'target shows the active session in the table');

    await click(commonSelectors.HREF(urls.sessions));
    assert
      .dom(selectors.TABLE_SESSIONS_STATUS(instances.session.id))
      .includesText('Active');

    // simulate that the session was cancelled and reached a terminated status externally
    instances.session.status = STATUS_SESSION_TERMINATED;

    await click(commonSelectors.HREF(urls.targets));
    assert
      .dom(selectors.TABLE_TARGETS_ROW(instances.sshTarget.id))
      .exists('the target is still listed in the table');
    assert
      .dom(selectors.TABLE_ACTIVE_SESSIONS(instances.sshTarget.id))
      .doesNotExist('the target does not have an active session');
    assert.strictEqual(
      emberDataSessionModel.status,
      STATUS_SESSION_TERMINATED,
      'the session ember data model status is updated',
    );
  });

  test('user can navigate to active sessions from targets table', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.targets));
    await click(selectors.TABLE_ACTIVE_SESSIONS(instances.sshTarget.id));

    assert.strictEqual(currentRouteName(), 'scopes.scope.sessions.index');
    assert.dom(selectors.TABLE_SESSIONS_ID(instances.session.id)).isVisible();
  });

  test('targets table is sorted by `created_time` descending by default', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.schema.targets.all().destroy();
    const createdTimeToNameMapping = {};
    CREATED_TIME_VALUES_ARRAY.forEach((value, index) => {
      createdTimeToNameMapping[value] = NAME_VALUES_ARRAY[index];
    });
    faker.helpers.shuffle(CREATED_TIME_VALUES_ARRAY).forEach((value) => {
      this.server.create('target', {
        name: createdTimeToNameMapping[value],
        created_time: value,
        scope: instances.scopes.project,
      });
    });
    await visit(urls.targets);

    assert
      .dom(commonSelectors.TABLE_ROWS)
      .isVisible({ count: CREATED_TIME_VALUES_ARRAY.length });
    NAME_VALUES_ARRAY.forEach((expected, index) => {
      // nth-child index starts at 1
      assert.dom(commonSelectors.TABLE_ROW(index + 1)).containsText(expected);
    });
  });

  test.each(
    'sorting',
    {
      'on name': {
        attribute: {
          key: 'name',
          values: NAME_VALUES_ARRAY,
        },
        expectedAscendingSort: NAME_VALUES_ARRAY,
        column: 1,
      },
      'on type': {
        attribute: {
          key: 'type',
          values: [TYPE_TARGET_SSH, TYPE_TARGET_TCP, TYPE_TARGET_SSH],
        },
        expectedAscendingSort: ['Generic TCP', 'SSH', 'SSH'],
        column: 2,
      },
      'on id': {
        attribute: {
          key: 'id',
          values: ID_VALUES_ARRAY,
        },
        expectedAscendingSort: ID_VALUES_ARRAY,
        column: 4,
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

      this.server.schema.targets.all().destroy();
      faker.helpers.shuffle(input.attribute.values).forEach((value) => {
        this.server.create('target', {
          [input.attribute.key]: value,
          scope: instances.scopes.project,
        });
      });
      await visit(urls.targets);

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

  test('user can only see RDP and TCP targets when rdp-target feature is enabled', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
          enabled: false,
        },
      },
    });

    featuresService.disable('ssh-target');

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.targets));

    assert.dom(commonSelectors.HREF(urls.tcpTarget)).isVisible();
    assert.dom(commonSelectors.HREF(urls.rdpTarget)).isVisible();
    assert.dom(commonSelectors.HREF(urls.sshTarget)).doesNotExist();

    await click(commonSelectors.FILTER_DROPDOWN('type'));

    assert.dom(commonSelectors.FILTER_DROPDOWN_ITEM('tcp')).isVisible();
    assert.dom(commonSelectors.FILTER_DROPDOWN_ITEM('rdp')).isVisible();
    assert.dom(commonSelectors.FILTER_DROPDOWN_ITEM('ssh')).doesNotExist();
  });

  test('user can only see SSH and TCP targets when ssh-target feature is enabled', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
          enabled: false,
        },
      },
    });

    featuresService.disable('rdp-target');

    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.targets));

    assert.dom(commonSelectors.HREF(urls.tcpTarget)).isVisible();
    assert.dom(commonSelectors.HREF(urls.rdpTarget)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.sshTarget)).isVisible();

    await click(commonSelectors.FILTER_DROPDOWN('type'));

    assert.dom(commonSelectors.FILTER_DROPDOWN_ITEM('tcp')).isVisible();
    assert.dom(commonSelectors.FILTER_DROPDOWN_ITEM('rdp')).doesNotExist();
    assert.dom(commonSelectors.FILTER_DROPDOWN_ITEM('ssh')).isVisible();
  });
});
