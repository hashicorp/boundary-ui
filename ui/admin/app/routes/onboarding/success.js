import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OnboardingSuccessRoute extends Route {
  // =services
  @service router;
  @service session;
  @service browserObject;


  // =methods
  model() {
    const model = this.modelFor('onboarding');
    return {
      ...model,
      clusterUrl: this.browserObject.window.origin,
    };
  }

  @action
  showTargetList(scope) {
    const {
      project: { id: scopeID },
      target: { id: targetID },
    } = scope;
    this.router.transitionTo('scopes.scope.targets.target', scopeID, targetID);
  }
}
