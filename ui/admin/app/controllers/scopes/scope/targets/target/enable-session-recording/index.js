/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsTargetEnableSessionRecordingController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated enable session recording breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.target.enable-session-recording.title');
  }
}
