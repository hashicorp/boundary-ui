import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeTargetsTargetEnableSessionRecordingIndexController extends Controller {
  @controller('scopes/scope/targets/index') targets;

  // =services

  @service router;

  // =actions

  /**
   * Reset the selected storage bucket and redirect to target
   * @param {TargetModel} target
   */
  @action
  cancel(target) {
    const { id } = target;
    target.rollbackAttributes();
    this.router.transitionTo('scopes.scope.targets.target', id);
  }
}
