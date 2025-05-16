/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { faker } from '@faker-js/faker';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';

module('Acceptance | session recordings | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let featuresService;

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
    instances.scopes.global = this.server.create('scope', { id: 'global' });
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
    instances.sessionRecording = this.server.create('session-recording', {
      scope: instances.scopes.global,
      create_time_values: {
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
      },
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

    await authenticateSession({});
  });

  test('users can navigate to session-recordings with proper authorization', async function (assert) {
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
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.sessionRecordings));

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 2 });

    await click(commonSelectors.FILTER_DROPDOWN('user'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM(instances.user.id));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('user'));

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 1 });
  });

  test('user can filter session recordings by scope', async function (assert) {
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.sessionRecordings));

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 2 });

    await click(commonSelectors.FILTER_DROPDOWN('target'));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM(instances.target.id));
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('target'));

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 1 });
  });

  test('user can filter session recordings by target', async function (assert) {
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.sessionRecordings));

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 2 });

    await click(commonSelectors.FILTER_DROPDOWN('scope'));
    await click(
      commonSelectors.FILTER_DROPDOWN_ITEM(instances.target.scope.id),
    );
    await click(commonSelectors.FILTER_DROPDOWN_ITEM_APPLY_BTN('scope'));

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 1 });
  });

  test('user can filter session recordings by time', async function (assert) {
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.sessionRecordings));

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 2 });

    await click(commonSelectors.FILTER_DROPDOWN('time'));
    await click(selectors.LAST_3_DAYS_OPTION);

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 1 });
  });
});
