/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { task, timeout } from 'ember-concurrency';

export default class LoadingButton extends Component {
  // =attributes

  toggleRefresh = task({ drop: true }, async () => {
    await this.args.onClick();
    await timeout(1000);
  });
}
