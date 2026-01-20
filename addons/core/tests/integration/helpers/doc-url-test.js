/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | doc-url', function (hooks) {
  setupRenderingTest(hooks);

  let config;
  let baseURL = hooks.beforeEach(function () {
    config = this.owner.resolveRegistration('config:environment');
    baseURL = config.documentation.baseURL;
  });

  test('it renders a URL generated from the documentation config', async function (assert) {
    const path = config.documentation.topics.account;
    await render(hbs`{{doc-url 'account'}}`);

    assert.ok(baseURL);
    assert.ok(path);
    assert.strictEqual(this.element.textContent.trim(), `${baseURL}${path}`);
  });

  test('it throws an error if the specified documentation path cannot be found', async function (assert) {
    const Helper = this.owner.lookup('helper:doc-url');
    const helper = new Helper(this.owner);

    assert.ok(helper.compute(['account']), 'Specified document exists.');
    assert.throws(() => {
      helper.compute(['no.such.doc']);
    }, 'Specified documentation was not found, so the helper threw an error.');
  });

  test('it renders a URL generated from the documentation config without baseURL', async function (assert) {
    const path = config.documentation.topics['host-catalog.aws.region'];
    await render(hbs`{{doc-url 'host-catalog.aws.region'}}`);

    assert.ok(baseURL);
    assert.ok(path);
    assert.strictEqual(this.element.textContent.trim(), path);
  });
});
