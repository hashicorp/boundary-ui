import GeneratedScopeModel from '../generated/models/scope';
import { belongsTo, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';

export const scopeTypes = {
  global: 'global',
  org: 'org',
  project: 'project'
};

export default class ScopeModel extends GeneratedScopeModel {

  // =relationships

  /**
   * The parent scope, if any.
   * @type {ScopeModel}
   */
  @belongsTo('scope', {inverse: 'childrenScopes'}) parentScope;

  /**
   * The inverse of parent scope, children.
   * @type {ScopeModelp[]}
   */
  @hasMany('scope', {inverse: 'parentScope'}) childrenScopes;

  // =computed

  /**
   * @type {boolean}
   */
  @computed('type')
  get isGlobal() {
    return this.type === scopeTypes.global;
  }
  // There is only one global scope and it cannot be created by clients,
  // thus no set.

  /**
   * @type {boolean}
   */
  @computed('type')
  get isOrg() {
    return this.type === scopeTypes.org;
  }
  set isOrg(value) {
    if (value) this.type = scopeTypes.org;
  }

  /**
   * @type {boolean}
   */
  @computed('type')
  get isProject() {
    return this.type === scopeTypes.project;
  }
  set isProject(value) {
    if (value) this.type = scopeTypes.project;
  }

}
