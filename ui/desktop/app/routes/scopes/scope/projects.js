/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
  // =attributes

  job;

  // =services

  @service session;
  @service resourceFilterStore;
  @service router;
  @service store;
  @service intl;
  @service ipc;
  @service clientAgentSessions;
  @service pollster;
  @service flashMessages;

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
  async model() {
    // Setup the poller job
    if (!this.job) {
      this.boundPoller = this.poller.bind(this);
      this.job = this.pollster.findOrCreateJob(this.boundPoller, 2000);
    }

    const isClientAgentRunning = await this.ipc.invoke('isClientAgentRunning');
    if (isClientAgentRunning) {
      this.job.start();
    }

    const { id: scope_id } = this.modelFor('scopes.scope');
    const projects = this.resourceFilterStore.queryBy(
      'scope',
      { type: 'project' },
      { recursive: true, scope_id },
    );
    return projects;
  }

  willDestroy() {
    this.job?.stop();
    super.willDestroy();
  }

  /**
   * Poll for new sessions with credentials. Sends a notification for each new session that has a credential.
   */
  async poller() {
    let sessions;

    try {
      sessions = await this.clientAgentSessions.getNewSessionsWithCredentials();
    } catch (e) {
      // TODO: Log this error

      // If we're unauthenticated, try and re-authenticate
      if (e.statusCode === 401 || e.statusCode === 403) {
        const sessionData = this.session.data?.authenticated;
        const auth_token_id = sessionData?.id;
        const token = sessionData?.token;

        try {
          await this.ipc.invoke('addTokenToDaemons', {
            tokenId: auth_token_id,
            token,
          });
          this.job.start();
          return;
        } catch (e) {
          // TODO: Log this error
          // If it fails again, just let the poller be killed
        }
      }

      if (this.job) {
        this.flashMessages.danger(
          this.intl.t('errors.client-agent-failed.sessions'),
          {
            notificationType: 'error',
            sticky: true,
            dismiss: (flash) => flash.destroyMessage(),
          },
        );

        // Kill the poller if we get an error
        this.job.stop();
      }

      return;
    }

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
        await this.ipc.invoke('focusWindow');
      };
    });
  }
}
