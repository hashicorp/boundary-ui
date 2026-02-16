/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

const STATUS_BADGE = '.hds-badge';
const ACTION_BUTTON = 'button';
const REVEAL_BUTTON = '.hds-reveal button';
const CARD_CONTAINER = 'hds-card__container';
const ERROR_MESSAGES = '.hds-reveal__content > p';
const LAST_ERROR_MESSAGE = '.hds-reveal__content > p:last-child';

module(
  'Integration | Component | settings-card/client-agent',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    test('it renders running badge and pause button', async function (assert) {
      this.set('model', {
        clientAgentStatus: {
          status: 'running',
          errors: [],
        },
      });

      await render(hbs`<SettingsCard::ClientAgent @model={{this.model}}/>`);

      assert.dom(STATUS_BADGE).hasText('Running');
      assert.dom(ACTION_BUTTON).hasText('Pause');
    });

    test('it renders paused badge and resume button', async function (assert) {
      this.set('model', {
        clientAgentStatus: {
          status: 'paused',
          errors: [],
        },
      });

      await render(hbs`<SettingsCard::ClientAgent @model={{this.model}}/>`);

      assert.dom(STATUS_BADGE).hasText('Paused');
      assert.dom(ACTION_BUTTON).hasText('Resume');
    });

    test('it does not render component if there is no status', async function (assert) {
      this.set('model', {
        clientAgentStatus: {
          errors: [{ message: 'agent is offline' }],
        },
      });

      await render(hbs`<SettingsCard::ClientAgent @model={{this.model}}/>`);

      assert.dom(STATUS_BADGE).doesNotExist();
      assert.dom(ACTION_BUTTON).doesNotExist();
      assert.dom(CARD_CONTAINER).doesNotExist();
    });

    test('it renders errors', async function (assert) {
      this.set('model', {
        clientAgentStatus: {
          status: 'running',
          errors: [
            { message: 'agent is wonky' },
            { message: 'another error' },
            { message: 'big oof' },
          ],
        },
      });

      await render(hbs`<SettingsCard::ClientAgent @model={{this.model}}/>`);

      assert.dom(ERROR_MESSAGES).doesNotExist();

      await click(REVEAL_BUTTON);

      assert.dom(ERROR_MESSAGES).isVisible({ count: 3 });
      assert.dom(LAST_ERROR_MESSAGE).hasText('big oof');
    });
  },
);
