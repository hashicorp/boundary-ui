/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable ember/no-controller-access-in-routes */
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { TrackedArray } from 'tracked-built-ins';

export default class ScopesScopeWorkersWorkerCreateTagsRoute extends Route {
  // =services

  @service confirm;
  @service intl;

  @action
  async willTransition(transition) {
    if (this.controller.get('apiTags').length) {
      transition.abort();
      try {
        await this.confirm.confirm(this.intl.t('questions.abandon-confirm'), {
          title: 'titles.abandon-confirm',
          confirm: 'actions.discard',
        });
        this.controller.set('apiTags', new TrackedArray([]));
        transition.retry();
      } catch (e) {
        // if user denies, do nothing
      }
    }
  }
}
