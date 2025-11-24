/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class VariableTimeFieldIndex extends Component {
  @tracked days;
  @tracked hours;
  @tracked minutes;
  @tracked data = this.createDataRow();

  constructor() {
    super(...arguments);
    this.initializeTimeFields();
  }

  initializeTimeFields() {
    let totalSeconds = this.args.time || 0;
    this.days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    this.hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    this.minutes = Math.floor(totalSeconds / 60);
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
      (days || 0) * 86400 + (hours || 0) * 3600 + (minutes || 0) * 60;
    this.args.updateTime(totalSeconds);
  }

  @action
  setMax() {
    if (this.args.max == null) {
      return;
    }
    let maxSeconds = this.args.max;
    this.days = Math.floor(maxSeconds / 86400);
    maxSeconds %= 86400;
    this.hours = Math.floor(maxSeconds / 3600);
    maxSeconds %= 3600;
    this.minutes = Math.floor(maxSeconds / 60);
    this.data = this.createDataRow();

    this.args.updateTime(this.args.max);
  }
}
