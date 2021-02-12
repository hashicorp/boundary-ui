import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeProjectsTargetsTargetSessionsRoute extends Route {

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

}
