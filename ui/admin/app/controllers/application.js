/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  // =services

  @service session;
  @service features;
  @service featureEdition;
  @service flashMessages;

  // =actions

  /**
   * Delegates invalidation to the session service.
   */
  @action
  invalidateSession() {
    this.session.invalidate();
  }

  /**
   * Applies the specified color theme to the root ember element.
   * @param {string} theme - "light", "dark", or nullish (system default)
   */
  @action
  toggleTheme(theme) {
    const rootElementSelector = getOwner(this).rootElement;
    const rootEl = getOwner(this)
      .lookup('service:-document')
      .querySelector(rootElementSelector);
    this.session.set('data.theme', theme);
    switch (theme) {
      case 'light':
        rootEl.classList.add('rose-theme-light');
        rootEl.classList.remove('rose-theme-dark');
        break;
      case 'dark':
        rootEl.classList.add('rose-theme-dark');
        rootEl.classList.remove('rose-theme-light');
        break;
      default:
        rootEl.classList.remove('rose-theme-dark');
        rootEl.classList.remove('rose-theme-light');
    }
  }

  /**
   * Switches to specified edition.
   * Options are oss, enterprise, and hcp.
   * @param {string} edition
   */
  @action
  toggleEdition(edition) {
    this.featureEdition.setEdition(edition);
  }

  /**
   *
   * @param {string} feature
   */
  @action
  toggleFeature(feature) {
    if (this.features.isEnabled(feature)) {
      this.features.disable(feature);
    } else {
      this.features.enable(feature);
    }
  }
}
