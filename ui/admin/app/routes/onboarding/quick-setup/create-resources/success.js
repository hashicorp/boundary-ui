import Route from '@ember/routing/route';

export default class OnboardingQuickSetupCreateResourcesSuccessRoute extends Route {
  // =methods

  model() {
    return this.modelFor('onboarding.quick-setup.create-resources');
  }
}
