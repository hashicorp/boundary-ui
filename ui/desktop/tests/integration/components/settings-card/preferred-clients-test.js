/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import Service from '@ember/service';

module(
  'Integration | Component | settings-card/preferred-clients',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    test('it renders protocol and preferred client correctly', async function (assert) {
      this.owner.register(
        'service:rdp',
        class extends Service {
          rdpClients = ['windows-app', 'none'];
          preferredRdpClient = 'windows-app';
        },
      );
      await render(hbs`<SettingsCard::PreferredClients />`);

      assert
        .dom('.hds-table tbody tr td:first-child')
        .hasText('Windows RDP', 'Protocol is rendered');
      assert
        .dom('select option:checked')
        .hasText('Windows App', 'Preferred client is selected');
    });
  },
);
