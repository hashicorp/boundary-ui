/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TrackedArray } from 'tracked-built-ins';

export default class ScopesScopeWorkersWorkerCreateTagsRoute extends Route {
  // =services

  @service confirm;
  @service intl;

  @action
  async willTransition(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    if (controller.apiTags.length) {
      transition.abort();
      try {
        await this.confirm.confirm(this.intl.t('questions.abandon-confirm'), {
          title: 'titles.abandon-confirm',
          confirm: 'actions.discard',
        });
        controller.set('apiTags', new TrackedArray([]));
        transition.retry();
      } catch (e) {
        // if user denies, do nothing
      }
    }
  }
}
