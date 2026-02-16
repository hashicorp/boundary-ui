/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';

const THEMES = [
  {
    label: 'system',
    value: 'system-default-theme',
  },
  {
    label: 'light',
    value: 'light',
  },
  {
    label: 'dark',
    value: 'dark',
  },
];

export default class SettingsApplicationComponent extends Component {
  // =services
  @service session;

  /**
   * Returns available themes
   */
  get themes() {
    return THEMES;
  }
}
