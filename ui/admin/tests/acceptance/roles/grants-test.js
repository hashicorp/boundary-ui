/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import * as selectors from './selectors';

module('Acceptance | roles | grants', function (hooks) {
  setupApplicationTest(hooks);

  const GRANT_STRINGS = [
    'ids=hc_123;actions=read',
    'type=credential-store;ids=;actions=read',
  ];

  const instances = {
    scopes: {
      org: null,
    },
    role: null,
  };
  const urls = {
    roles: null,
    role: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.role = this.server.create('role', {
      scope: instances.scopes.org,
      grant_strings: GRANT_STRINGS,
    });
    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.role = `${urls.roles}/${instances.role.id}`;
    urls.grants = `${urls.role}/grants`;
  });

  test('visiting role grants', async function (assert) {
    await visit(urls.grants);

    assert.strictEqual(currentURL(), urls.grants);
    assert.dom(selectors.GRANT_CODE_BLOCK).hasText(GRANT_STRINGS.join('\n'));
    assert.dom(selectors.GRANTS_BTNS).isVisible();
  });

  test('cannot set grants without proper authorization', async function (assert) {
    const authorized_actions = instances.role.authorized_actions.filter(
      (item) => item !== 'set-grants',
    );
    instances.role.update({ authorized_actions });
    await visit(urls.grants);

    assert.dom(selectors.GRANTS_BTNS).doesNotExist();
    assert.dom(selectors.GRANT_CODE_BLOCK).hasText(GRANT_STRINGS.join('\n'));
  });
});
