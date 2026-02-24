/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
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
