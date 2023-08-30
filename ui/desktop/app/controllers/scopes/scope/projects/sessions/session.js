/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';

export default class ScopesScopeProjectsSessionsSessionController extends Controller {
  // =attributes

  /**
   * A list of sessions filtered to the current user and sorted by created time,
   * and active/pending.
   * @type {SessionModel[]}
   */
  get canOpenNewShell() {
    //todo: return a boolen to toggle new shell btn
    return;
  }
}
