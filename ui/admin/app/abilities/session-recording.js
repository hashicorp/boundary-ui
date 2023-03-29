/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import SessionRecordingAbility from 'api/abilities/session-recording';
import { inject as service } from '@ember/service';

export default class OverrideSessionRecordingAbility extends SessionRecordingAbility {
  // =service
  @service features;

  /**
   * This override ensures that session recordings may be read only if the
   * session-recording feature flag is enabled.
   */
  get canRead() {
    return this.features.isEnabled('session-recording') ? super.canRead : false;
  }

  /**
   * This override ensures that session recordings can only be presented in the global scope
   * and if the session-recording feature flag is enabled.
   */
  get canList() {
    return this.features.isEnabled('session-recording')
      ? this.hasAuthorizedCollectionAction('list') && this.model.isGlobal
      : false;
  }

  get canNavigate() {
    return this.canList;
  }
}
