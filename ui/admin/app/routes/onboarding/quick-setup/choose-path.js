import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OnboardingQuickSetupChoosePathRoute extends Route {
  // =services

  @service router;

  // =actions

  @action
  choosePath(path = 'guided') {
    switch (path) {
      case 'guided':
        this.router.transitionTo('onboarding.quick-setup.create-resources');
        break;
      case 'manual':
      default:
        this.router.transitionTo('scopes.scope.new', 'global');
        break;
    }
  }
}
