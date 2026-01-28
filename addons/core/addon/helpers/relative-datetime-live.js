/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Helper from '@ember/component/helper';
import { service } from '@ember/service';

const MILLISECOND = 1;
const SECOND = MILLISECOND * 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const MONTH = DAY * 31;
const YEAR = MONTH * 12;

const unitMappings = [
  {
    unit: 'second',
    value: SECOND,
  },
  {
    unit: 'minute',
    value: MINUTE,
  },
  {
    unit: 'hour',
    value: HOUR,
  },
  {
    unit: 'day',
    value: DAY,
  },
  {
    unit: 'month',
    value: MONTH,
  },
  {
    unit: 'year',
    value: YEAR,
  },
];

export default class extends Helper {
  // =services

  @service clockTick;
  @service intl;

  // =methods

  compute([date]) {
    if (!date) return;

    const delta = date.valueOf() - this.clockTick.now;
    const greatestMeaningfulUnit = unitMappings.reduce(
      (currentValue, previousValue) => {
        return Math.abs(delta) >= previousValue.value
          ? previousValue
          : currentValue;
      },
      unitMappings[0],
    );
    const scaledDelta =
      delta < 0
        ? Math.ceil(delta / greatestMeaningfulUnit.value)
        : Math.floor(delta / greatestMeaningfulUnit.value);
    const unit = greatestMeaningfulUnit.unit;
    return this.intl.formatRelative(scaledDelta, {
      unit,
      numeric: 'auto',
    });
  }
}
