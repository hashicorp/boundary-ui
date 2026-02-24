/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | format-bytes-size', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders file size in human-readable string', async function (assert) {
    // Size to B
    const expectedSizeB = '1 B';
    this.set('inputNumberSizeB', 1);
    this.set('inputStringSizeB', '1');

    await render(hbs`{{format-bytes-size this.inputNumberSizeB}}`);
    assert.dom(this.element).hasText(expectedSizeB);
    await render(hbs`{{format-bytes-size this.inputStringSizeB}}`);
    assert.dom(this.element).hasText(expectedSizeB);

    // Size to kB
    const expectedSizeKb = '108.93 kB';
    this.set('inputNumberSizeKb', 108930);
    this.set('inputStringSizeKb', '108930');

    await render(hbs`{{format-bytes-size this.inputNumberSizeKb}}`);
    assert.dom(this.element).hasText(expectedSizeKb);
    await render(hbs`{{format-bytes-size this.inputStringSizeKb}}`);
    assert.dom(this.element).hasText(expectedSizeKb);

    // Size to MB
    const expectedSizeMb = '164.73 MB';
    this.set('inputNumberSizeMb', 164730000);
    this.set('inputStringSizeMb', '164730000');

    await render(hbs`{{format-bytes-size this.inputNumberSizeMb}}`);
    assert.dom(this.element).hasText(expectedSizeMb);
    await render(hbs`{{format-bytes-size this.inputStringSizeMb}}`);
    assert.dom(this.element).hasText(expectedSizeMb);

    // Size to GB
    const expectedSizeGb = '2.15 GB';
    this.set('inputNumberSizeGb', 2147483647);
    this.set('inputStringSizeGb', '2147483647');

    await render(hbs`{{format-bytes-size this.inputNumberSizeGb}}`);
    assert.dom(this.element).hasText(expectedSizeGb);
    await render(hbs`{{format-bytes-size this.inputStringSizeGb}}`);
    assert.dom(this.element).hasText(expectedSizeGb);

    // Size to TB
    const expectedSizeTb = '12.37 TB';
    this.set('inputNumberSizeTb', 12370000000000);
    this.set('inputStringSizeTb', '12370000000000');

    await render(hbs`{{format-bytes-size this.inputNumberSizeTb}}`);
    assert.dom(this.element).hasText(expectedSizeTb);
    await render(hbs`{{format-bytes-size this.inputStringSizeTb}}`);
    assert.dom(this.element).hasText(expectedSizeTb);

    // Size to PB
    const expectedSizePb = '9.01 PB';
    this.set('inputNumberSizePb', 9007199254740991);
    this.set('inputStringSizePb', '9007199254740991');

    await render(hbs`{{format-bytes-size this.inputNumberSizePb}}`);
    assert.dom(this.element).hasText(expectedSizePb);
    await render(hbs`{{format-bytes-size this.inputStringSizePb}}`);
    assert.dom(this.element).hasText(expectedSizePb);

    /* eslint-disable no-loss-of-precision */
    // Size to EB
    const expectedSizeEb = '1.24 EB';
    this.set('inputNumberSizeEb', 1237000000000000000);
    this.set('inputStringSizeEb', '1237000000000000000');

    await render(hbs`{{format-bytes-size this.inputNumberSizeEb}}`);
    assert.dom(this.element).hasText(expectedSizeEb);
    await render(hbs`{{format-bytes-size this.inputStringSizeEb}}`);
    assert.dom(this.element).hasText(expectedSizeEb);

    // Size to ZB
    const expectedSizeZb = '900.72 ZB';
    this.set('inputNumberSizeZb', 900719985474899195498367);
    this.set('inputStringSizeZb', '900719985474899195498367');

    await render(hbs`{{format-bytes-size this.inputNumberSizeZb}}`);
    assert.dom(this.element).hasText(expectedSizeZb);
    await render(hbs`{{format-bytes-size this.inputStringSizeZb}}`);
    assert.dom(this.element).hasText(expectedSizeZb);

    // Size to YB
    const expectedSizeYb = '90.07 YB';
    this.set('inputNumberSizeYb', 90071992547409919549836723);
    this.set('inputStringSizeYb', '90071992547409919549836723');

    await render(hbs`{{format-bytes-size this.inputNumberSizeYb}}`);
    assert.dom(this.element).hasText(expectedSizeYb);
    await render(hbs`{{format-bytes-size this.inputStringSizeYb}}`);
    assert.dom(this.element).hasText(expectedSizeYb);
  });
});
