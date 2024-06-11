import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeTargetsTargetAddHostSourcesController extends Controller {
  // =services

  @service router;

  // =actions

  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async save(target, hostSetIDs) {
    await target.addHostSources(hostSetIDs);
    this.router.replaceWith('scopes.scope.targets.target.host-sources');
  }

  /**
   * Redirect to target host sources as if nothing ever happened.
   */
  @action
  cancel() {
    this.router.replaceWith('scopes.scope.targets.target.host-sources');
  }
}
