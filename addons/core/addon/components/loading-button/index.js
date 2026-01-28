/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { dropTask, timeout } from 'ember-concurrency';

export default class LoadingButton extends Component {
  // =attributes

  toggleRefresh = dropTask(async () => {
    await this.args.onClick();
    await timeout(1000);
  });
}
