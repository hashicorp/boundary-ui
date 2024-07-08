/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { TrackedArray } from 'tracked-built-ins';

export default class ScopesScopeWorkersWorkerCreateTagsRoute extends Route {
  // =services

  @service confirm;
  @service intl;
  @service router;

  constructor() {
    super(...arguments);
    /**
     * If user attempts to navigate away from unsaved changes, the user is
     * asked to confirm that they would like to discard the changes.  If the
     * user chooses discard, changes apiTags are cleared and the
     * transition is retried.  If the user cancels discard, the transition is
     * aborted.
     */
    this.router.on('routeWillChange', async (transition) => {
      const fromName = transition?.from?.name;
      const toName = transition?.to?.name;
      // This will prevent the confirmation dialog from showing when the user
      // saves or cancels the form.
      if (toName === 'scopes.scope.workers.worker.tags') {
        return;
      }
      // eslint-disable-next-line ember/no-controller-access-in-routes
      const controller = this.controllerFor(
        'scopes.scope.workers.worker.create-tags',
      );
      const tags = controller.get('apiTags');

      if (fromName !== toName && tags.length) {
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
    });
  }
}
