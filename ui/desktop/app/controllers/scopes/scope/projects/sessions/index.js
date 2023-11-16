/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';

export default class ScopesScopeProjectsSessionsIndexController extends Controller {
  // =attributes

  /**
   * A list of sessions filtered to the current user and sorted by created time,
   * and active/pending.
   * @type {SessionModel[]}
   */
  get sorted() {
    const sessions = this.model;
    return [
      // then move active sessions to the top
      ...sessions.filter((session) => session.isAvailable),
      // and all others to the end
      ...sessions.filter((session) => !session.isAvailable),
    ];
  }
}
