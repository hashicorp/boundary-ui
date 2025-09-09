/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  TYPE_TARGET_SSH,
  TYPE_TARGET_RDP,
  TYPE_TARGET_TCP,
} from 'api/models/target';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | session/tabs', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test.each(
    'it shows correct content for different target types',
    [
      {
        targetType: TYPE_TARGET_TCP,
        targetId: 'tcp-target-1',
        defaultPort: 9000,
        proxyPort: 9000,
        shouldShowTabs: true,
      },
      {
        targetType: TYPE_TARGET_SSH,
        targetId: 'ssh-target-4',
        defaultPort: 22,
        proxyPort: 9000,
        shouldShowTabs: true,
      },
      {
        targetType: TYPE_TARGET_RDP,
        targetId: 'rdp-target-2',
        defaultPort: 3389,
        proxyPort: 3389,
        shouldShowTabs: false,
      },
    ],
    async function (
      assert,
      { targetType, targetId, defaultPort, proxyPort, shouldShowTabs },
    ) {
      this.store.createRecord('target', {
        id: targetId,
        type: targetType,
        address: 'example.com',
        default_port: defaultPort,
        scope: {
          scope_id: 'p_123',
          type: 'project',
        },
      });

      const session = this.store.createRecord('session', {
        id: `session-${targetId}`,
        target_id: targetId,
        proxy_address: '127.0.0.1',
        proxy_port: proxyPort,
      });

      this.set('model', session);

      await render(hbs`<Session::Tabs @model={{this.model}} />`);

      if (shouldShowTabs) {
        assert.dom('.hds-tabs').exists();
      } else {
        assert.dom('.hds-tabs').doesNotExist();
      }

      assert.dom('[data-test-proxy-url]').exists();
      assert.dom('[data-test-session-details]').exists();
    },
  );
});
