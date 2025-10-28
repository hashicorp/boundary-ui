/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import Service from '@ember/service';
import { RDP_CLIENT_WINDOWS_APP, RDP_CLIENT_NONE } from 'desktop/services/rdp';

module(
  'Integration | Component | settings-card/preferred-clients',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    test('it renders protocol and preferred client correctly', async function (assert) {
      let updatedPreferredRDPClient;
      this.owner.register(
        'service:rdp',
        class extends Service {
          rdpClients = [RDP_CLIENT_WINDOWS_APP, RDP_CLIENT_NONE];
          preferredRdpClient = RDP_CLIENT_WINDOWS_APP;
          setPreferredRdpClient = (value) => {
            updatedPreferredRDPClient = value;
          };
        },
      );
      await render(hbs`<SettingsCard::PreferredClients />`);

      assert
        .dom('.hds-table tbody tr td:first-child')
        .hasText('Windows RDP', 'Protocol is rendered');
      assert
        .dom('select option:checked')
        .hasText('Windows App', 'Preferred client is selected');

      let select = find('select');
      select.value = RDP_CLIENT_NONE;
      await triggerEvent(select, 'change');

      assert
        .dom('select option:checked')
        .hasText('None', 'Preferred client is updated');

      assert.strictEqual(
        updatedPreferredRDPClient,
        RDP_CLIENT_NONE,
        'setPreferredRdpClient is called with correct value',
      );
    });

    test('it renders recommended client link when only none is detected', async function (assert) {
      this.owner.register(
        'service:rdp',
        class extends Service {
          rdpClients = [RDP_CLIENT_NONE];
          recommendedRdpClient = {
            name: RDP_CLIENT_WINDOWS_APP,
            link: 'https://apps.apple.com/us/app/windows-app/id1295203466',
          };
        },
      );
      await render(hbs`<SettingsCard::PreferredClients />`);

      assert
        .dom('.hds-table tbody tr td:first-child')
        .hasText('Windows RDP', 'Protocol is rendered');

      assert
        .dom('.hds-table tbody tr td:last-child')
        .includesText(
          'None detected. We recommend Windows App',
          'None detected message is rendered',
        );

      assert
        .dom('.hds-table tbody tr td:last-child a')
        .hasAttribute(
          'href',
          'https://apps.apple.com/us/app/windows-app/id1295203466',
          'windows app download link is rendered',
        );
    });
  },
);
