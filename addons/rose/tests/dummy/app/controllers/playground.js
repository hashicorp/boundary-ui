/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PlaygroundController extends Controller {
  color = 'green';

  @action
  actionHandler(/*value*/) {
    // eslint-disable-next-line no-console
    //console.log('action handled');
  }
}
