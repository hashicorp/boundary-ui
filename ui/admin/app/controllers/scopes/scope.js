/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeController extends Controller {
  @controller('application') application;
  // =services

  @service session;
  @service scope;
  @service featureEdition;

  /**
   * Returns the side-bar element.
   * @type {object}
   */
  get sideBarContainer() {
    return document.querySelector('#global-app-frame-sidebar');
  }
}
