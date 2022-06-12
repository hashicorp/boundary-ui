import Route from '@ember/routing/route';

export default class OnboardingQuickSetupSuccessRoute extends Route {
  // =methods

  model() {
    return this.modelFor('onboarding.quick-setup.create-resources');
  }
}
