/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class HeaderNavComponent extends Component {
  // =services

  @service session;
  @service scope;
}
