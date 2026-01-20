/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, select } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import Service from '@ember/service';
import {
  RDP_CLIENT_WINDOWS_APP,
  RDP_CLIENT_NONE,
  RDP_CLIENT_WINDOWS_APP_LINK,
} from 'desktop/services/rdp';

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

      await select('select', RDP_CLIENT_NONE);

      assert
        .dom('select option:checked')
        .hasText('None', 'Preferred client is updated');

      assert.strictEqual(
        updatedPreferredRDPClient,
        RDP_CLIENT_NONE,
        'setPreferredRdpClient is called with correct value',
      );
    });

    test('it renders recommended client link only when none is detected', async function (assert) {
      this.owner.register(
        'service:rdp',
        class extends Service {
          rdpClients = [RDP_CLIENT_NONE];
          recommendedRdpClient = {
            name: RDP_CLIENT_WINDOWS_APP,
            link: RDP_CLIENT_WINDOWS_APP_LINK,
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
          RDP_CLIENT_WINDOWS_APP_LINK,
          'windows app download link is rendered',
        );
    });
  },
);
