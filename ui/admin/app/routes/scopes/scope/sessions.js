import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { all, hash } from 'rsvp';
import { A } from '@ember/array';
import runEvery from 'ember-pollster/decorators/route/run-every';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import config from '../../../config/environment';
import { resourceFilter } from 'core/decorators/resource-filter';

const POLL_TIMEOUT_SECONDS = config.sessionPollingTimeoutSeconds;

export default class ScopesScopeSessionsRoute extends Route {
  // =services

  @service intl;
  @service notify;
  @service session;
  @service resourceFilterStore;
  @service router;

  // =attributes

  @resourceFilter({
    allowed: ['active', 'pending', 'canceling', 'terminated'],
    defaultValue: ['active', 'pending', 'canceling'],
  })
  status;

  @runEvery(POLL_TIMEOUT_SECONDS * 1000)
  poller() {
    return this.refresh();
  }

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Loads all sessions under the current scope and encapsulates them into
   * an array of objects containing their associated users and targets.
   * @return {Promise{[{session: SessionModel, user: UserModel, target: TargetModel}]}}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const { status } = this;
    const sessions = await this.resourceFilterStore.queryBy(
      'session',
      { status },
      { scope_id }
    );

    const sessionAggregates = await all(
      sessions.map((session) =>
        hash({
          session,
          user: session.user_id
            ? this.store.peekRecord('user', session.user_id) ||
              this.store.findRecord('user', session.user_id)
            : null,
          target: session.target_id
            ? this.store.peekRecord('target', session.target_id) ||
              this.store.findRecord('target', session.target_id)
            : null,
        })
      )
    );
    // Sort sessions by time created...
    let sortedSessionAggregates = A(sessionAggregates)
      .sortBy('session.created_time')
      .reverse();
    // Then move active sessions to the top...
    sortedSessionAggregates = [
      ...sortedSessionAggregates.filter(
        (aggregate) => aggregate.session.status === 'active'
      ),
      ...sortedSessionAggregates.filter(
        (aggregate) => aggregate.session.status !== 'active'
      ),
    ];
    return sortedSessionAggregates;
  }

  // =actions

  /**
   * Cancels the specified session and notifies user of success or error.
   * @param {SessionModel}
   */
  @action
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.canceled-success')
  async cancelSession(session) {
    await session.cancelSession();
  }

  /**
   * Sets the specified resource filter field to the specified value.
   * @param {string} field
   * @param value
   */
  @action
  filterBy(field, value) {
    this[field] = value;
  }

  /**
   * Clears and filter selections.
   */
  @action
  clearAllFilters() {
    this.status = [];
  }
}
