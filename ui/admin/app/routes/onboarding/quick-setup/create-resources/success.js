import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';

export default class OnboardingQuickSetupCreateResourcesSuccessRoute extends Route {
  // =attributes

  /**
   * Looks up the window object indirectly.
   * @type {Window}
   */
  get window() {
    // The Ember way of accessing globals...
    const document = getOwner(this).lookup('service:-document').documentElement;
    // defaultView === window, but without using globals directly
    return document.parentNode.defaultView;
  }
  // =methods

  model() {
    const model = this.modelFor('onboarding.quick-setup.create-resources');
    return {
      ...model,
      origin: this.window.location.origin,
    };
  }
}
