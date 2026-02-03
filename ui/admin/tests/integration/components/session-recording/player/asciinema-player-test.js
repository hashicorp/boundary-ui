/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { render, waitUntil } from '@ember/test-helpers';
import { setupRenderingTest } from 'admin/tests/helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | session-recording/player/asciinema-player',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      assert.expect(1);

      const asciicast = await fetch('/session.cast');
      const asciicastContent = await asciicast.text();
      this.set('data', asciicastContent);

      await render(
        hbs`<SessionRecording::Player::AsciinemaPlayer @data={{this.data}} @poster='npt:1:30' />`,
      );
      // AsciinemaPlayer does not come with a "ready" event, and its
      // initialization is async.  Therefore tests must `waitUntil` the expected
      // DOM state is reached.
      await waitUntil(() =>
        assert
          .dom('.ap-player')
          .hasAnyText('ember-asciinema-player git:(main*)'),
      );
    });
  },
);
