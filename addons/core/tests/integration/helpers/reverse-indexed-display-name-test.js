/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Helper | reverse-indexed-display-name', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders the resource name with its position in parent array reversed', async function (assert) {
    this.set('array', ['Boundary', 'is', 'cool!']);

    await render(hbs`{{reverse-indexed-display-name
  'resources.session-recording.connection.title_index'
  this.array
  'Boundary'
}}`);

    assert.dom(this.element).hasText('Connection 3');

    await render(hbs`{{reverse-indexed-display-name
  'resources.session-recording.connection.title_index'
  this.array
  'is'
}}`);

    assert.dom(this.element).hasText('Connection 2');

    await render(hbs`{{reverse-indexed-display-name
  'resources.session-recording.connection.title_index'
  this.array
  'cool!'
}}`);

    assert.dom(this.element).hasText('Connection 1');
  });

  test('it does not render the position if the index cannot be found', async function (assert) {
    this.set('array', ['Boundary', 'is', 'cool!']);

    await render(hbs`{{reverse-indexed-display-name
  'resources.session-recording.connection.title_index'
  this.array
  'Watchtower'
}}`);

    assert.dom(this.element).hasText('Connection');
  });
});
