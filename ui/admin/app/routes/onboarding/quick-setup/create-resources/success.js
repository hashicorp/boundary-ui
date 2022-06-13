import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OnboardingQuickSetupCreateResourcesSuccessRoute extends Route {
  // =methods
  @service router;
  model() {
    return this.modelFor('onboarding.quick-setup.create-resources');
  }

  @action
  showTargetList(scope) {
    const {
      project: { id: scopeID },
    } = scope;
    this.router.transitionTo('scopes.scope.targets', scopeID);
  }
}
