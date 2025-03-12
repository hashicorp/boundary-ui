/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service intl;

  beforeModel() {
    this.intl.setLocale(['en-us']);
  }
}
