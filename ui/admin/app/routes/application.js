/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { A } from '@ember/array';
import { formatDbName } from 'api/services/sqlite';

/**
 * Entry route for the application.
 */
export default class ApplicationRoute extends Route {
  // =services

  @service session;
  @service confirm;
  @service router;
  @service intl;
  @service features;
  @service featureEdition;
  @service sqlite;
  @service('browser/window') window;

  // =attributes

  routeIfUnauthenticated = 'index';

  // =methods

  constructor() {
    super(...arguments);
    /**
     * If user attempts to navigate away from unsaved changes, the user is
     * asked to confirm that they would like to discard the changes.  If the
     * user chooses discard, changes on the model are rolled back and the
     * transition is retried.  If the user cancels discard, the transition is
     * aborted.
     */
    this.router.on('routeWillChange', async (transition) => {
      const fromName = transition?.from?.name;
      const toName = transition?.to?.name;
      const maybeModel =
        transition?.data?.model ?? transition?.from?.attributes;
      if (fromName !== toName && maybeModel?.hasDirtyAttributes) {
        transition.abort();
        try {
          await this.confirm.confirm(this.intl.t('questions.abandon-confirm'), {
            title: 'titles.abandon-confirm',
            confirm: 'actions.discard',
          });
          maybeModel?.rollbackAttributes();
          transition.retry();
        } catch (e) {
          // if user denies, do nothing
        }
      }
    });
  }

  async beforeModel() {
    this.intl.setLocale(['en-us']);
    await this.session.setup();
    const theme = this.session.get('data.theme');
    /* eslint-disable-next-line ember/no-controller-access-in-routes */
    const controller = this.controllerFor(this.routeName);
    controller.toggleTheme(theme);

    // Setup the DB from a successful authentication restoration
    if (this.session.isAuthenticated) {
      const userId = this.session.data?.authenticated?.user_id;
      const hostUrl = this.window.location.host;
      if (userId && hostUrl) {
        await this.sqlite.setup(formatDbName(userId, hostUrl));
      }

      await this.session.loadAuthenticatedAccount();
    }
  }

  /**
   * Invalidates the session if a 401 error occurs and returns false to
   * prevent further error handling.
   * Returns true in all other cases, allowing error handling to occur (such
   * as displaying the `error.hbs` template, if one exists).
   * @param {Error} e
   */
  @action
  error(e) {
    const isUnauthenticated = A(e?.errors)?.[0]?.isUnauthenticated;
    if (isUnauthenticated) {
      this.session.invalidate();
      return false;
    }
    return true;
  }
}
