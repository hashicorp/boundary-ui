/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;

export default class VariableTimeFieldIndex extends Component {
  @tracked days;
  @tracked hours;
  @tracked minutes;
  @tracked data;

  constructor() {
    super(...arguments);
    this.initializeTimeFields();
  }

  initializeTimeFields() {
    let totalSeconds = this.args.time || 0;
    this.days = Math.floor(totalSeconds / SECONDS_PER_DAY);
    totalSeconds %= SECONDS_PER_DAY;
    this.hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
    totalSeconds %= SECONDS_PER_HOUR;
    this.minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
    this.data = this.createDataRow();
  }

  createDataRow() {
    return [{ days: this.days, hours: this.hours, minutes: this.minutes }];
  }

  @action
  updateTime(key, { target: { value } }) {
    this.data[0][key] = Number(value);
    const days = this.data[0].days;
    const hours = this.data[0].hours;
    const minutes = this.data[0].minutes;

    let totalSeconds =
      (days || 0) * SECONDS_PER_DAY +
      (hours || 0) * SECONDS_PER_HOUR +
      (minutes || 0) * SECONDS_PER_MINUTE;
    this.args.updateTime(totalSeconds);
  }

  @action
  setMax() {
    if (this.args.max == null) {
      return;
    }
    let maxSeconds = this.args.max;
    this.days = Math.floor(maxSeconds / SECONDS_PER_DAY);
    maxSeconds %= SECONDS_PER_DAY;
    this.hours = Math.floor(maxSeconds / SECONDS_PER_HOUR);
    maxSeconds %= SECONDS_PER_HOUR;
    this.minutes = Math.floor(maxSeconds / SECONDS_PER_MINUTE);
    this.data = this.createDataRow();

    this.args.updateTime(this.args.max);
  }
}
