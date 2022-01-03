import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeRoute extends Route {
  // =services

  @service intl;
  @service session;
  @service scope;
  @service router;

  // =methods

  /**
   * Attempt to load the specified scope from the API.  This is allowed
   * to fail, since in some cases the user may not have permission to read a
   * scope directly, but may have permission to read resources under it.
   * If the scope fails to load, we still proceed using a temporary scope object
   * consisting of only the specified ID.
   * @param {object} params
   * @param {string} params.scope_id
   * @return {Promise{ScopeModel}}
   */
  model({ scope_id: id }) {
    // Since only global and org scopes are authenticatable, we can infer type
    // from ID because global has a fixed ID.
    const type = id === 'global' ? 'global' : 'org';
    return this.store.findRecord('scope', id).catch(() => {
      const maybeExistingScope = this.store.peekRecord('scope', id);
      const scopeOptions = { id, type };
      /* istanbul ignore else */
      if (type === 'global') {
        scopeOptions.name = this.intl.t('titles.global');
      }
      return (
        maybeExistingScope || this.store.createRecord('scope', scopeOptions)
      );
    });
  }

  /**
   * Load all scopes within the current scope context.  Always attempt to load
   * org scopes.  Only attempt to load project scopes if the current scope is
   * a project.  These are used for scope navigation.
   */
  async afterModel(model) {
    // First, load orgs and, if necessary, projects
    let orgs, projects;
    orgs = await this.store
      .query('scope', { scope_id: 'global' })
      .catch(() => A([]));
    if (model.isProject) {
      projects = await this.store.query('scope', { scope_id: model.scopeID });
    }
    // Then pull out the "selected" scopes, if relevant
    let selectedOrg, selectedProject;
    if (model.isGlobal || model.isOrg) selectedOrg = model;
    if (model.isProject) {
      selectedProject = model;
      selectedOrg = this.store.peekRecord('scope', model.scopeID);
    }
    // Update the scope service with the current scope(s);
    this.scope.org = selectedOrg;
    this.scope.project = selectedProject;
    this.scopes = { orgs, projects, selectedOrg, selectedProject };
    // Update the controller (if exists), since setupController is only
    // called once the first time the route is activated.  It is not called
    // again on route refreshes.
    /* eslint-disable-next-line ember/no-controller-access-in-routes */
    if (this.controller) this.setControllerProperties(this.scopes);
  }

  /**
   * Adds the scopes hash to the controller context (see `afterModel`).
   * @param {Controller} controller
   */
  setupController(/* controller */) {
    super.setupController(...arguments);
    this.setControllerProperties(this.scopes);
  }

  /**
   * Updates the controller's `scopes`.
   * @param {array} scopes
   */
  setControllerProperties(scopes) {
    /* eslint-disable-next-line ember/no-controller-access-in-routes */
    this.controller.setProperties({ scopes });
  }

  /**
   * Renders the scope-specific header template.
   * @override
   * @param {object} controller
   * @param {object} model
   */
  renderTemplate() {
    super.renderTemplate(...arguments);
    this.render('scopes/scope/-header-nav', {
      into: 'application',
      outlet: 'header-nav',
    });
  }

  // =actions

  /**
   * Rollback changes on scope.
   * @param {Model} scope
   */
  @action
  cancel(scope) {
    const { isNew } = scope;
    scope.rollbackAttributes();
    if (isNew) this.transitionTo('scopes.scope');
  }

  /**
   * Handle save scope.
   * @param {Model} scope
   * @param {Event} e
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success'
  )
  async save(scope) {
    const { isNew } = scope;
    await scope.save();
    await this.transitionTo('scopes.scope.edit', scope);
    if (isNew) this.refresh();
  }

  /**
   * Deletes the scope and redirects to index.
   * @param {Model} scope
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(scope) {
    const { scopeID } = scope;
    await scope.destroyRecord();
    await this.router.replaceWith('scopes.scope.scopes', scopeID);
    //this.refresh();
  }
}
