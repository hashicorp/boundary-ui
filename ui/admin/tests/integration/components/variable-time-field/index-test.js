/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | variable-time-field/index', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  const DAYS_INPUT = 'input[name="days"]';
  const HOURS_INPUT = 'input[name="hours"]';
  const MINUTES_INPUT = 'input[name="minutes"]';
  const SET_TO_MAX_BUTTON = 'button';
  const LEGEND = 'Test Legend';
  const ONE_HOUR = 3600; // in seconds
  const ONE_DAY = 86400; // in seconds

  hooks.beforeEach(function () {
    this.set('legend', LEGEND);
    this.set('time', ONE_HOUR);
    this.set('max', ONE_DAY);
    this.set('updateTime', () => {});
  });

  test('it renders', async function (assert) {
    await render(hbs`<VariableTimeField
      @legend={{this.legend}}
      @isRequired={{true}}
      @time={{this.time}}
      @updateTime={{this.updateTime}}
    />`);

    assert.dom('legend').containsText(LEGEND);
    assert.dom(DAYS_INPUT).hasValue('0');
    assert.dom(HOURS_INPUT).hasValue('1');
    assert.dom(MINUTES_INPUT).hasValue('0');

    await render(hbs`
      <VariableTimeField
        @legend={{this.legend}}
        @max={{this.max}}
        @time={{this.time}}
        @updateTime={{this.updateTime}}
      />
    `);

    assert.dom(SET_TO_MAX_BUTTON).hasText('Set to Max');
    assert.dom(DAYS_INPUT).hasValue('0');
    assert.dom(HOURS_INPUT).hasValue('1');
    assert.dom(MINUTES_INPUT).hasValue('0');
  });

  const testCases = [
    {
      input: DAYS_INPUT,
      value: '2',
      expectedSeconds: 176400, // 2 days + 1 hour
      expectedValues: { days: '2', hours: '1', minutes: '0' },
    },
    {
      input: HOURS_INPUT,
      value: '2',
      expectedSeconds: 7200, // 2 hours
      expectedValues: { days: '0', hours: '2', minutes: '0' },
    },
    {
      input: MINUTES_INPUT,
      value: '15',
      expectedSeconds: 4500, // 2 days + 1 minute
      expectedValues: { days: '0', hours: '1', minutes: '15' },
    },
  ];

  test.each(
    'it updates time on change',
    testCases,
    async function (assert, { input, value, expectedSeconds, expectedValues }) {
      this.set('updateTime', (seconds) => {
        if (seconds === expectedSeconds) {
          assert.ok(
            true,
            `updateTime called with correct calculated seconds value: ${seconds}`,
          );
        } else {
          assert.ok(
            false,
            `Unexpected seconds value: ${seconds}, expected: ${expectedSeconds}`,
          );
        }
      });

      await render(hbs`<VariableTimeField
      @legend={{this.legend}}
      @time={{this.time}}
      @updateTime={{this.updateTime}}
    />`);

      assert.dom(DAYS_INPUT).hasValue('0');
      assert.dom(HOURS_INPUT).hasValue('1');
      assert.dom(MINUTES_INPUT).hasValue('0');

      await fillIn(input, value);

      assert.dom(DAYS_INPUT).hasValue(expectedValues.days);
      assert.dom(HOURS_INPUT).hasValue(expectedValues.hours);
      assert.dom(MINUTES_INPUT).hasValue(expectedValues.minutes);
    },
  );

  test('it sets to max time on button click', async function (assert) {
    assert.expect(4);
    this.set('legend', 'Test Legend');
    this.set('time', 0);
    this.set('max', 90061); // 1 day, 1 hour, 1 minute, and 1 second in seconds
    this.set('updateTime', (totalSeconds) => {
      assert.strictEqual(
        totalSeconds,
        90061,
        'updateTime called with max total seconds',
      );
    });

    await render(hbs`<VariableTimeField
      @legend={{this.legend}}
      @time={{this.time}}
      @max={{this.max}}
      @updateTime={{this.updateTime}}
    />`);

    await click('button');

    assert.dom('input[name="days"]').hasValue('1');
    assert.dom('input[name="hours"]').hasValue('1');
    assert.dom('input[name="minutes"]').hasValue('1');
  });
});
