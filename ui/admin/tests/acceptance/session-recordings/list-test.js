/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { faker } from '@faker-js/faker';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { formatDateUserFriendly } from 'admin/tests/helpers/format-date-user-friendly';
import {
  STATE_SESSION_RECORDING_STARTED,
  STATE_SESSION_RECORDING_AVAILABLE,
  STATE_SESSION_RECORDING_UNKNOWN,
} from 'api/models/session-recording';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | session-recordings | list', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);
  setupIntl(hooks, 'en-us');

  const CREATED_TIME_VALUES_ARRAY = [
    '2020-01-01T00:00:00.010Z',
    '2020-01-01T00:00:00.100Z',
    '2020-01-01T00:00:01.000Z',
    '2020-01-01T00:00:10.000Z',
    '2020-01-01T00:01:00.000Z',
  ];

  const CREATED_TIME_VALUES_FORMATTED = CREATED_TIME_VALUES_ARRAY.map(
    formatDateUserFriendly,
  );

  let featuresService;
  let createdTimeValues;

  // Instances
  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
      project2: null,
    },
    target: null,
    target2: null,
    user: null,
    user2: null,
    sessionRecording: null,
    sessionRecording2: null,
  };

  // Urls
  const urls = {
    globalScope: null,
    sessionRecordings: null,
    sessionRecording: null,
    sessionRecording2: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.schema.scopes.find('global');
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.scopes.project2 = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
    });
    instances.target2 = this.server.create('target', {
      scope: instances.scopes.project2,
    });
    instances.user = this.server.create('user');
    instances.user2 = this.server.create('user');
    createdTimeValues = {
      target: {
        id: instances.target.id,
        name: instances.target.name,
        scope: {
          id: instances.scopes.project.id,
          name: instances.scopes.project.name,
          parent_scope_id: instances.scopes.org.id,
        },
      },
      user: instances.user.attrs,
    };
    instances.sessionRecording = this.server.create('session-recording', {
      scope: instances.scopes.global,
      create_time_values: createdTimeValues,
    });
    instances.sessionRecording2 = this.server.create('session-recording', {
      scope: instances.scopes.global,
      created_time: faker.date.past(),
      create_time_values: {
        target: {
          id: instances.target2.id,
          name: instances.target2.name,
          scope: {
            id: instances.scopes.project2.id,
            name: instances.scopes.project2.name,
            parent_scope_id: instances.scopes.org.id,
          },
        },
        user: instances.user2.attrs,
      },
    });
    urls.globalScope = `/scopes/global`;
    urls.sessionRecordings = `${urls.globalScope}/session-recordings`;
    urls.sessionRecording = `${urls.sessionRecordings}/${instances.sessionRecording.id}/channels-by-connection`;
    urls.sessionRecording2 = `${urls.sessionRecordings}/${instances.sessionRecording2.id}/channels-by-connection`;

    featuresService = this.owner.lookup('service:features');
    featuresService.enable('ssh-session-recording');
  });

  test('users can navigate to session-recordings with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.globalScope);
    assert.true(
      instances.scopes.global.authorized_collection_actions[
        'session-recordings'
      ].includes('list'),
    );

    assert.dom(commonSelectors.HREF(urls.sessionRecordings)).isVisible();
    assert
      .dom(commonSelectors.SIDEBAR_NAV_CONTENT)
      .includesText(selectors.SESSION_RECORDING_TITLE);

    // Visit session recordings
    await click(commonSelectors.HREF(urls.sessionRecordings));

    assert.strictEqual(currentURL(), urls.sessionRecordings);
  });

  test('users cannot navigate to session-recordings without the list action', async function (assert) {
    instances.scopes.global.authorized_collection_actions[
      'session-recordings'
    ] = [];
    await visit(urls.globalScope);

    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'session-recordings'
      ].includes('list'),
    );
    assert
      .dom(commonSelectors.SIDEBAR_NAV_CONTENT)
      .doesNotIncludeText(selectors.SESSION_RECORDING_TITLE);
    assert.dom(commonSelectors.HREF(urls.sessionRecordings)).doesNotExist();
  });

  test('user can search for a session recording by id', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.sessionRecordings));

    assert.dom(commonSelectors.HREF(urls.sessionRecording)).isVisible();
    assert.dom(commonSelectors.HREF(urls.sessionRecording2)).isVisible();

    await fillIn(commonSelectors.SEARCH_INPUT, instances.sessionRecording.id);
    await waitFor(commonSelectors.HREF(urls.sessionRecording2), { count: 0 });

    assert.dom(commonSelectors.HREF(urls.sessionRecording)).isVisible();
    assert.dom(commonSelectors.HREF(urls.sessionRecording2)).doesNotExist();
  });

  test('user can search for a session recording by id and get no results', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.sessionRecordings));

    assert.dom(commonSelectors.HREF(urls.sessionRecording)).isVisible();
    assert.dom(commonSelectors.HREF(urls.sessionRecording2)).isVisible();

    await fillIn(commonSelectors.SEARCH_INPUT, 'sr_404');
    await waitFor(selectors.NO_RESULTS_MSG, { count: 1 });

    assert.dom(commonSelectors.HREF(urls.sessionRecording)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.sessionRecording2)).doesNotExist();
    assert.dom(selectors.NO_RESULTS_MSG).includesText('No results found');
  });

  test('user can filter session recordings by user', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.sessionRecordings));

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 2 });

    await click(commonSelectors.FILTER_DROPDOWN('user'));
    await waitFor(commonSelectors.FILTER_DROPDOWN_ITEM(instances.user.id));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM(instances.user.id));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('user'));

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 1 });
  });

  test('user can filter session recordings by target', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.sessionRecordings));

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 2 });

    await click(commonSelectors.FILTER_DROPDOWN('target'));
    await waitFor(commonSelectors.FILTER_DROPDOWN_ITEM(instances.target.id));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM(instances.target.id));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('target'));

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 1 });
  });

  test('user can filter session recordings by scope', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.sessionRecordings));

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 2 });

    await click(commonSelectors.FILTER_DROPDOWN('scope'));
    await waitFor(
      commonSelectors.FILTER_DROPDOWN_ITEM(instances.target.scope.id),
    );
    await click(
      commonSelectors.FILTER_DROPDOWN_ITEM(instances.target.scope.id),
    );
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('scope'));

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 1 });
  });

  test('user can filter session recordings by time', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.sessionRecordings));

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 2 });

    await click(commonSelectors.FILTER_DROPDOWN('time'));
    await click(selectors.LAST_3_DAYS_OPTION);

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 1 });
  });

  test('session recordings table is sorted by `created_time` descending by default', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.schema.sessionRecordings.all().destroy();
    const expectedDescendingSort = CREATED_TIME_VALUES_ARRAY.toReversed();
    const expectedDescendingFormattedSort =
      CREATED_TIME_VALUES_FORMATTED.toReversed();
    faker.helpers.shuffle(expectedDescendingSort).forEach((value) => {
      this.server.create('session-recording', {
        created_time: value,
        scope: instances.scopes.global,
        create_time_values: createdTimeValues,
      });
    });
    await visit(urls.sessionRecordings);

    assert
      .dom(commonSelectors.TABLE_ROWS)
      .isVisible({ count: CREATED_TIME_VALUES_ARRAY.length });
    expectedDescendingFormattedSort.forEach((expected, index) => {
      // nth-child index starts at 1
      assert.dom(commonSelectors.TABLE_ROW(index + 1)).containsText(expected);
    });
  });

  test.each(
    'sorting',
    {
      'on created_time': {
        attribute: {
          key: 'created_time',
          values: CREATED_TIME_VALUES_ARRAY,
        },
        expectedAscendingSort: CREATED_TIME_VALUES_FORMATTED,
        column: 1,
      },
      'on state': {
        attribute: {
          key: 'state',
          values: [
            STATE_SESSION_RECORDING_AVAILABLE,
            STATE_SESSION_RECORDING_UNKNOWN,
            STATE_SESSION_RECORDING_STARTED,
          ],
        },
        expectedAscendingSort: ['Completed', 'Failed', 'Recording'],
        column: 2,
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

      this.server.schema.sessionRecordings.all().destroy();
      faker.helpers.shuffle(input.attribute.values).forEach((value) => {
        this.server.create('session-recording', {
          [input.attribute.key]: value,
          scope: instances.scopes.global,
          create_time_values: createdTimeValues,
        });
      });
      await visit(urls.sessionRecordings);

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
