/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import runEvery from 'ember-pollster/decorators/route/run-every';

/**
 * TODO:  This route is now vestigial.  Desktop does not provide project-based
 * navigation.  This route formerly provided a way to aggregate
 * all project scopes, which was necessary to then aggregate targets and
 * sessions under those projects.  Since the API now provides recursive listing,
 * it's possible to load all targets and sessions with a single call, no client-
 * side aggregation required.
 *
 * However, it _is_ necessary to prime the store with all project scopes.
 * This allows the UI to display project names on associated resources.
 *
 * The priming function of this route could be moved to scopes or scopes/scope.
 * It no longer makes sense as a dedicated route.
 */
export default class ScopesScopeProjectsRoute extends Route {
  // =services

  @service session;
  @service resourceFilterStore;
  @service router;
  @service store;
  @service intl;
  @service ipc;
  @service clientAgentSessions;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Primes the store with _all project scopes_ under global.
   * @return {Promise{ScopeModel}}
   */
  model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const projects = this.resourceFilterStore.queryBy(
      'scope',
      { type: 'project' },
      { recursive: true, scope_id },
    );
    return projects;
  }

  /**
   * Poll for new sessions with credentials. Sends a notification for each new session that has a credential.
   */
  @runEvery(2000)
  async poller() {
    const sessions =
      await this.clientAgentSessions.getNewSessionsWithCredentials();

    sessions.forEach((session) => {
      new window.Notification(
        this.intl.t('notifications.connected-to-target.title', {
          target: session.alias,
        }),
        {
          body: this.intl.t('notifications.connected-to-target.description'),
        },
      ).onclick = async () => {
        let orgScope = 'global';

        try {
          const aliases = await this.store.query('alias', {
            recursive: true,
            scope_id: 'global',
            force_refresh: true,
          });
          const alias = aliases.find((alias) => alias.value === session.alias);

          const target = await this.store.findRecord(
            'target',
            alias.destination_id,
          );
          orgScope = target.scope.parent_scope_id;
        } catch (e) {
          // Do nothing and default scope to global if an error occurs
        }

        window.location.href = `serve://boundary/#/scopes/${orgScope}/projects/sessions/${session.session_authorization.session_id}`;
        this.ipc.invoke('focusWindow');
      };
    });
  }
}
