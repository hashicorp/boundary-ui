/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import config from '../../../config/environment';

const POLL_TIMEOUT_SECONDS = config.sessionPollingTimeoutSeconds;
const { __electronLog } = globalThis;

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
  @service clientAgentSessions;
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
   * @return {Promise<ScopeModel>}
   */
  async model() {
    const isClientAgentRunning = await window.boundary.isClientAgentRunning();
    if (isClientAgentRunning) {
      this.poller.perform();
      // start polling task
    } else {
      this.poller.cancelAll();
      // cancel polling job
    }

    const { id: scope_id } = this.modelFor('scopes.scope');
    const projects = this.resourceFilterStore.queryBy(
      'scope',
      { type: 'project' },
      { recursive: true, scope_id },
    );
    return projects;
  }

  /**
   * Cancel poller task instances when exiting this route.
   */
  deactivate() {
    this.poller.cancelAll();
  }

  /**
   * Poll for new sessions with credentials. Sends a notification for each new session that has a credential.
   */
  poller = restartableTask(async () => {
    let sessions;

    // We use a while loop to poll for new sessions from the client agent.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        sessions =
          await this.clientAgentSessions.getNewSessionsWithCredentials();
      } catch (e) {
        // If we're unauthenticated, try and re-authenticate
        if (e.statusCode === 401 || e.statusCode === 403) {
          const sessionData = this.session.data?.authenticated;
          const auth_token_id = sessionData?.id;
          const token = sessionData?.token;

          try {
            await window.boundary.addTokenToDaemons({
              tokenId: auth_token_id,
              token,
            });

            __electronLog?.info('Starting polling of new sessions again');
            this.poller.perform();
            return;
          } catch (e) {
            __electronLog?.error('Failed to add token to daemons', e.message);
            // If it fails again, just let the poller be killed
          }
        }

        __electronLog?.error('Failed to get new Sessions', e.message);
        this.flashMessages.danger(
          this.intl.t('errors.client-agent-failed.sessions'),
          {
            color: 'critical',
            title: this.intl.t('states.error'),
            sticky: true,
            dismiss: (flash) => flash.destroyMessage(),
          },
        );

        __electronLog?.info('Stopping polling of new sessions');
        return;
      }

      sessions.forEach((session) => {
        new window.Notification(
          this.intl.t('notifications.connected-to-target.title', {
            target: session.alias,
          }),
          {
            body: this.intl.t('notifications.connected-to-target.description'),
            // This only has an effect on windows
            requireInteraction: true,
          },
        ).onclick = async () => {
          let orgScope = 'global';

          try {
            const aliases = await this.store.query('alias', {
              scope_id: 'global',
              force_refresh: true,
            });
            const alias = aliases.find(
              (alias) => alias.value === session.alias,
            );

            const target = await this.store.findRecord(
              'target',
              alias.destination_id,
            );
            orgScope = target.scope.parent_scope_id;
          } catch (e) {
            // Do nothing and default scope to global if an error occurs
          }

          window.location.href = `serve://boundary/#/scopes/${orgScope}/projects/sessions/${session.session_authorization.session_id}`;
          await window.boundary.focusWindow();
        };
      });
      await timeout(POLL_TIMEOUT_SECONDS * 1000);
    }
  });
}
