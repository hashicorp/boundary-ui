import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeOnboardingQuickSetupCreateResourcesRoute extends Route {
  // =services

  @service router;

  // =methods

  model() {
    // const scopeModel = this.modelFor('scopes.scope');
    // TODO:  locally create resources necessary for onboarding:
    //  - org
    //  - project
    //  - host catalog
    //  - host set
    //  - host <- this is the one that will be edited in the form
    //  - target
  }

  // =actions

  @action
  @loading
  @notifyError(({ message }) => message)
  submit(createHost = true) {
    if (createHost) {
      // TODO:  save all created resources
      this.router.transitionTo(
        'scopes.scope.onboarding.quick-setup.create-resources.success'
      );
    }
    // else {
    //   // TODO:  save resources up to host catalog/host set?
    //   this.router.transitionTo('scopes.scope.host-catalogs.host-catalog.host-sets')
    // }
  }
}
