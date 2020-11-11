import Route from '@ember/routing/route';
import { all } from 'rsvp';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsRoute extends Route {
  // =services

  @service scope;

  // =methods

  /**
   * Loads all targets under current scope.
   * @return {Promise{[TargetModel]}}
   */
  async model() {
    let projectTargets = await all(this.scope.projects.map(({ id: scope_id }) => 
      this.store.query('target', { scope_id })
    ))
    let targets = projectTargets.map((target) => target.toArray()).flat();
    return targets.map((target) => {
      return {
        target,
        project: this.store.peekRecord('scope', target.scopeID),
      }
    })
  }

}
