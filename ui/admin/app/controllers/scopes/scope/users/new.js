/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ScopesScopeUsersNewController extends Controller {
  @controller('scopes/scope/users/index') users;
  @tracked timeToLiveSeconds = 5184000;
  @tracked timeToStaleSeconds = 0;


  @action
  updateTTL(seconds) {
    console.log('Updating TTL to', seconds);
    this.timeToLiveSeconds = seconds;
  }

  @action
  updateTTS(seconds) {
    console.log('Updating TTS to', seconds);
    this.timeToStaleSeconds = seconds;
  }
}
