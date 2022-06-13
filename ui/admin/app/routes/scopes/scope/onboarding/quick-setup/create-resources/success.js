import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeOnboardingQuickSetupCreateResourcesSuccessRoute extends Route {
  // =methods
  @service router;
  model() {
    return this.modelFor(
      'scopes.scope.onboarding.quick-setup.create-resources'
    );
  }

  //actions
  @action
  routeToTarget(scope) {
    const { project : { id: scopeID }} = scope
    this.router.transitionTo(
      'scopes.scope.targets', scopeID
    );
  }

}
