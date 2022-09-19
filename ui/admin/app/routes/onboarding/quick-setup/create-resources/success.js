import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OnboardingQuickSetupCreateResourcesSuccessRoute extends Route {
  // =services
  @service router;

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
      clusterUrl: this.window.location.origin,
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
