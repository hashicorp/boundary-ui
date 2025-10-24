/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { defaultValidator } from 'ember-a11y-refocus';
import { paramValueFinder } from 'core/utils/param-value-finder';

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

export default class ApplicationController extends Controller {
  // =services

  @service session;
  @service features;
  @service featureEdition;
  @service flashMessages;
  @service router;
  @service sqlite;

  /**
   * Returns available themes.
   * @type {array}
   */
  get themes() {
    return THEMES;
  }

  /**
   * Shows side navigation only for routes nested under a scope
   * and if user has been authenticated.
   * @type {boolean}
   */
  get showSideNav() {
    return (
      this.router.currentRouteName.startsWith('scopes.scope') &&
      this.session.isAuthenticated
    );
  }

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
   * Toggles on/off specified features.
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

  @action
  @loading
  async downloadDatabase() {
    await this.sqlite.downloadDatabase();
  }

  @action
  async clearDatabase() {
    await this.sqlite.clearDatabase();
    this.router.refresh();
  }

  /**
   * Add custom route change validation to prevent refocus when
   * user is attempting to search, filter, or sort.
   * @param {object} transition
   * @returns {boolean}
   */
  customRouteChangeValidator(transition) {
    if (!transition.to || !transition.from) {
      return true;
    }
    if (transition.to.name === transition.from.name) {
      const toParams = paramValueFinder(
        transition.to.localName,
        transition.to.parent,
      );
      const fromParams = paramValueFinder(
        transition.from.localName,
        transition.from.parent,
      );
      // Return false to prevent refocus when routes have equivalent dynamic segments (params).
      return JSON.stringify(toParams) !== JSON.stringify(fromParams);
    }
    return defaultValidator(transition);
  }
}
