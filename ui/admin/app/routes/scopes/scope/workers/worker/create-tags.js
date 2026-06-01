/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TrackedArray } from 'tracked-built-ins';
import Tag from 'admin/components/form/worker/tag';

export default class ScopesScopeWorkersWorkerCreateTagsRoute extends Route {
  // =services

  @service confirm;
  @service intl;

  @action
  async willTransition(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    if (
      controller.apiTags.some((tag) => tag.key?.trim() || tag.value?.trim())
    ) {
      transition.abort();
      try {
        await this.confirm.confirm(this.intl.t('questions.abandon-confirm'), {
          title: 'titles.abandon-confirm',
          confirm: 'actions.discard',
        });
        controller.set('apiTags', new TrackedArray([new Tag()]));
        transition.retry();
      } catch {
        // if user denies, do nothing
      }
    }
  }
}
