/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | heap/player', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(1);

    const asciicast = await fetch('/example.cast');
    const asciicastContent = await asciicast.text();
    this.set('data', asciicastContent);

    await render(hbs`<Heap::Player @data={{this.data}} @poster='npt:1:30' />`);
    // AsciinemaPlayer does not come with a "ready" event, and its
    // initialization is async.  Therefore tests must `waitUntil` the expected
    // DOM state is reached.
    await waitUntil(() =>
      assert.dom('.ap-player')
        .hasAnyText('ember-asciinema-player git:(main*)')
    );
  });
});
