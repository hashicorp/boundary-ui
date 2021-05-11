import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeProjectsTargetsTargetSessionsRoute extends Route {
  // =services

  @service ipc;

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
    await this.ipc.invoke('cancel', { session_id: session.id });
  }
}
