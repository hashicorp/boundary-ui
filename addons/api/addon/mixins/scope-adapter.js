import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';

/**
 * Add this mixin to resource adapters which should be accessed via an
 * org/project-scoped URL.  This mixin appends a scope path based on the scope
 * reported by `ScopeService`.
 */
export default Mixin.create({
  // =services

  scope: service(),

  // =properties

  /**
   * If true and the current scope has a project, will include the project in
   * the resource path.  Set to false for resources that are scoped exclusively
   * to org.
   * @type {boolean}
   */
  includeProject: true,

  // =methods

  /**
   * Appends a scope path to the URL prefix, if a scope is set.
   * @override
   * @return {string}
   */
  urlPrefix() {
    const prefix = this._super(...arguments);
    let scopePath = this.scopePath;
    // Ensure a slash is added between prefix + scope path if needed.
    if (scopePath && prefix.charAt(prefix.length - 1) !== '/') {
      scopePath = `/${scopePath}`;
    }
    return `${prefix}${scopePath}`;
  },

  /**
   * Generates a scope path for the current scope as reported by `ScopeService`.
   * If no scope is set, returns empty string.
   * @return {string}
   */
  get scopePath() {
    const { org, project } = this.scope;
    const scopePath = [];
    if (org) scopePath.push('orgs', org.id);
    if (project && this.includeProject) scopePath.push('projects', project.id);
    return scopePath.join('/');
  },
});
