/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render, waitUntil, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | session-recording/player', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    const castConfig = {
      version: 2,
      width: 124,
      height: 36,
      timestamp: 1670352594,
      env: { SHELL: '/bin/zsh', TERM: 'xterm-256color' },
    };
    this.cast = `${JSON.stringify(castConfig)}
[2.676444, "o", "y"]
[2.788653, "o", "a"]
[2.868652, "o", "r"]
[3.001764, "o", "n"]
[3.167636, "o", " "]
[3.313668, "o", "t"]
[3.460527, "o", "e"]
[3.561983, "o", "s"]
[3.63678, "o", "t"]`;

    await render(hbs`
      <SessionRecording::Player @asciicast={{this.cast}} @route='test.route' @model='t_123' />
    `);

    assert.dom('.session-recording-player-header').hasText('Back to channels');
    const result = await waitUntil(() =>
      find('.ap-player').textContent.includes('yarn test'),
    );
    assert.true(result);
  });
});
