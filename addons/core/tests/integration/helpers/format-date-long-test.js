/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | format-date-long', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders date in long format', async function (assert) {
    // Create a specific date: Oct 27, 2025, 3:30 PM PST
    const testDate = new Date('2025-10-27T15:30:00-07:00');
    this.set('date', testDate);

    await render(hbs`{{format-date-long this.date}}`);

    // Should render as "Oct 27, 2025, 3:30 PM PDT" or "Oct 27, 2025, 3:30 PM PST"
    // depending on daylight saving time
    const text = this.element.textContent.trim();
    assert.ok(
      text.includes('Oct 27, 2025'),
      'Date should include month, day, and year',
    );
    assert.ok(text.includes('3:30 PM'), 'Date should include time');
    // Check for timezone - should be either PDT or PST
    const hasPacificTimezone = text.includes('PDT') || text.includes('PST');
    assert.ok(hasPacificTimezone, 'Date should include Pacific timezone');
  });

  test('it returns empty string for null date', async function (assert) {
    this.set('date', null);

    await render(hbs`{{format-date-long this.date}}`);

    assert.strictEqual(this.element.textContent.trim(), '');
  });

  test('it returns empty string for undefined date', async function (assert) {
    this.set('date', undefined);

    await render(hbs`{{format-date-long this.date}}`);

    assert.strictEqual(this.element.textContent.trim(), '');
  });

  test('it formats date with Pacific timezone', async function (assert) {
    const testDate = new Date('2025-12-05T12:00:00-08:00');
    this.set('date', testDate);

    await render(hbs`{{format-date-long this.date}}`);

    const text = this.element.textContent.trim();
    // Should include PST or PDT based on daylight saving
    const hasPacificTimezone = text.includes('PST') || text.includes('PDT');
    assert.ok(hasPacificTimezone, 'Should include Pacific timezone');
  });

  test('it replaces "at" with comma in the format', async function (assert) {
    const testDate = new Date('2025-10-27T15:30:00-07:00');
    this.set('date', testDate);

    await render(hbs`{{format-date-long this.date}}`);

    const text = this.element.textContent.trim();
    // Should use comma separator, not " at "
    assert.notOk(text.includes(' at '), 'Should not contain " at "');
    // Format should be like "Oct 27, 2025, 3:30 PM PDT"
    const parts = text.split(',');
    assert.strictEqual(parts.length, 3, 'Should have 3 comma-separated parts');
  });

  test('it formats different months correctly', async function (assert) {
    assert.expect(3); // Expect 3 assertions (one for each month)

    const dates = [
      { date: new Date('2025-01-15T10:00:00-08:00'), month: 'Jan' },
      { date: new Date('2025-06-20T14:30:00-07:00'), month: 'Jun' },
      { date: new Date('2025-12-31T23:59:00-08:00'), month: 'Dec' },
    ];

    for (const { date, month } of dates) {
      this.set('date', date);
      await render(hbs`{{format-date-long this.date}}`);
      const text = this.element.textContent.trim();
      assert.ok(
        text.includes(month),
        `Should correctly format month as ${month}`,
      );
    }
  });
});
